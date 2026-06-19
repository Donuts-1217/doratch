/**
 * 雲端作品儲存配額：總容量 (MB) + 作品數量上限
 */
export function byteSizeOf(text) {
    try {
        return new TextEncoder().encode(String(text || "")).length;
    } catch (_) {
        return new Blob([String(text || "")]).size;
    }
}

export function projectBytesFromData(p) {
    if (!p || typeof p !== "object") return 0;
    let total = 0;
    if (typeof p.pythonCode === "string") total += byteSizeOf(p.pythonCode);
    if (typeof p.code === "string") total += byteSizeOf(p.code);
    if (typeof p.data === "string") total += byteSizeOf(p.data);
    if (p.spriteScripts && typeof p.spriteScripts === "object") {
        try { total += byteSizeOf(JSON.stringify(p.spriteScripts)); } catch (_) {}
    }
    return total;
}

export async function getDefaultCloudSettings(db, getDoc, doc) {
    try {
        const snap = await getDoc(doc(db, "system_config", "storage"));
        const data = snap.exists() ? (snap.data() || {}) : {};
        const current = Number(data.defaultCloudStorageLimitMB);
        const prev = Number(data.previousDefaultCloudStorageLimitMB);
        const maxFiles = Number(data.defaultCloudStorageMaxFiles);
        const currentMB = Number.isFinite(current) && current >= 1 ? current : 1;
        const previousMB = Number.isFinite(prev) && prev >= 1 ? prev : currentMB;
        const defaultMaxFiles = Number.isFinite(maxFiles) && maxFiles >= 1 ? Math.floor(maxFiles) : 10;
        return { currentMB, previousMB, defaultMaxFiles };
    } catch (_) {
        return { currentMB: 1, previousMB: 1, defaultMaxFiles: 10 };
    }
}

/**
 * @param {object} options
 * @param {string|null} options.targetPid - 更新既有作品時傳入 ID；新建時為 null
 * @param {number} [options.extraBytes] - 新增內容位元組（字串或額外 payload）
 * @param {object} [options.projectData] - 完整作品 payload（與 extraBytes 擇一）
 */
export async function enforceCloudStorageLimit(db, fns, user, options) {
    const { getDoc, getDocs, doc, setDoc, collection } = fns;
    const targetPid = options && options.targetPid ? options.targetPid : null;
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? (userSnap.data() || {}) : {};
    const defaults = await getDefaultCloudSettings(db, getDoc, doc);
    const defaultLimitMB = defaults.currentMB;
    const previousDefaultMB = defaults.previousMB;
    const defaultMaxFiles = defaults.defaultMaxFiles;
    const limitMB = Number.isFinite(userData.cloudStorageLimitMB) ? userData.cloudStorageLimitMB : defaultLimitMB;
    const maxFiles = Number.isFinite(userData.cloudStorageMaxFiles) && userData.cloudStorageMaxFiles >= 1
        ? Math.floor(userData.cloudStorageMaxFiles)
        : defaultMaxFiles;
    const limitBytes = Math.max(1, limitMB) * 1024 * 1024;

    const projectsSnap = await getDocs(collection(db, "users", user.uid, "projects"));
    const projectCount = projectsSnap.size;

    if (!targetPid && projectCount >= maxFiles) {
        throw new Error("CLOUD_STORAGE_FILE_LIMIT:" + maxFiles);
    }

    let totalBytes = 0;
    projectsSnap.forEach(function (d) {
        if (targetPid && d.id === targetPid) return;
        totalBytes += projectBytesFromData(d.data() || {});
    });
    if (options && options.projectData) {
        totalBytes += projectBytesFromData(options.projectData);
    } else {
        totalBytes += byteSizeOf(options && options.extraBytes != null ? options.extraBytes : "");
    }

    const now = Date.now();
    const graceUntil = Number(userData.cloudStorageGraceUntilMs || 0);
    if (totalBytes > limitBytes) {
        if (graceUntil > now) {
            await setDoc(userRef, {
                cloudStorageLastMeasuredBytes: totalBytes,
                cloudStorageLastEffectiveLimitMB: limitMB
            }, { merge: true });
            return;
        }
        const lastLimit = Number(userData.cloudStorageLastEffectiveLimitMB || 0);
        const lastBytes = Number(userData.cloudStorageLastMeasuredBytes || 0);
        const wasWithinLast = lastLimit > 0 && lastBytes >= 0 && lastBytes <= (lastLimit * 1024 * 1024);
        const usesDefaultLimit = !Number.isFinite(userData.cloudStorageLimitMB);
        const wasWithinPreviousDefault = usesDefaultLimit && previousDefaultMB > limitMB && totalBytes <= (previousDefaultMB * 1024 * 1024);
        if ((wasWithinLast && limitMB < lastLimit) || wasWithinPreviousDefault) {
            const newGrace = now + 30 * 24 * 60 * 60 * 1000;
            await setDoc(userRef, {
                cloudStorageGraceUntilMs: newGrace,
                cloudStorageLastMeasuredBytes: totalBytes,
                cloudStorageLastEffectiveLimitMB: limitMB
            }, { merge: true });
            return;
        }
        throw new Error("CLOUD_STORAGE_MB_LIMIT:" + limitMB);
    }
    await setDoc(userRef, {
        cloudStorageLastMeasuredBytes: totalBytes,
        cloudStorageLastEffectiveLimitMB: limitMB
    }, { merge: true });
}

export function cloudStorageErrorAlert(msg) {
    const text = String(msg || "");
    if (text.indexOf("CLOUD_STORAGE_MB_LIMIT:") === 0) {
        const lim = text.split(":")[1] || "?";
        return "雲端儲存空間不足。你的永久上限是 " + lim + " MB，請刪除舊作品或請管理員調高容量。";
    }
    if (text.indexOf("CLOUD_STORAGE_FILE_LIMIT:") === 0) {
        const lim = text.split(":")[1] || "?";
        return "雲端作品數量已達上限（" + lim + " 個檔案）。請刪除舊作品或請管理員調高上限。";
    }
    return null;
}
