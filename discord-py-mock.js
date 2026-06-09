/** discord.py 模擬模組 — 完整 async/await，與真實 discord.py 相同 */
(function (global) {
    "use strict";

    var MOCK_SOURCES = {
        "src/lib/doratch_browser.py":
            "_files = {}\n" +
            "\n" +
            "class _MemWriter:\n" +
            "    def __init__(self, path):\n" +
            "        self.path = path\n" +
            "        _files[path] = ''\n" +
            "    def __enter__(self):\n" +
            "        return self\n" +
            "    def __exit__(self, *a):\n" +
            "        return False\n" +
            "    def write(self, data):\n" +
            "        _files[self.path] = _files.get(self.path, '') + str(data)\n" +
            "\n" +
            "class _MemReader:\n" +
            "    def __init__(self, path):\n" +
            "        self.path = path\n" +
            "    def __enter__(self):\n" +
            "        return self\n" +
            "    def __exit__(self, *a):\n" +
            "        return False\n" +
            "    def read(self):\n" +
            "        return _files.get(self.path, '')\n" +
            "\n" +
            "def _exists(path):\n" +
            "    return path in _files\n" +
            "\n" +
            "def _open(path, mode='r'):\n" +
            "    if 'w' in str(mode):\n" +
            "        return _MemWriter(path)\n" +
            "    return _MemReader(path)\n" +
            "\n" +
            "def install():\n" +
            "    import os\n" +
            "    import builtins\n" +
            "    os.path.exists = _exists\n" +
            "    builtins.open = _open\n" +
            "\n",

        "src/lib/discord/__init__.py":
            "class Intents:\n" +
            "    def __init__(self):\n" +
            "        self.message_content = False\n" +
            "        self.guilds = True\n" +
            "    @staticmethod\n" +
            "    def default():\n" +
            "        return Intents()\n" +
            "    @staticmethod\n" +
            "    def all():\n" +
            "        i = Intents()\n" +
            "        i.message_content = True\n" +
            "        return i\n" +
            "\n" +
            "class ButtonStyle:\n" +
            "    primary = 1\n" +
            "    secondary = 2\n" +
            "    success = 3\n" +
            "    danger = 4\n" +
            "    link = 5\n" +
            "\n" +
            "class SelectOption:\n" +
            "    def __init__(self, label, value=None, description=None, emoji=None):\n" +
            "        self.label = label\n" +
            "        self.value = value if value is not None else label\n" +
            "        self.description = description\n" +
            "        self.emoji = emoji\n" +
            "\n" +
            "class Colour:\n" +
            "    blue = 0x5865F2\n" +
            "    green = 0x23a559\n" +
            "    red = 0xed4245\n" +
            "\n" +
            "class Interaction:\n" +
            "    pass\n" +
            "\n" +
            "class Embed:\n" +
            "    def __init__(self, title=None, description=None, colour=None, color=None):\n" +
            "        self.title = title\n" +
            "        self.description = description\n" +
            "        self.colour = colour if colour is not None else color\n" +
            "        self.fields = []\n" +
            "    def add_field(self, name, value, inline=False):\n" +
            "        self.fields.append({'name': name, 'value': value, 'inline': inline})\n" +
            "    def set_footer(self, text=None):\n" +
            "        self.footer = text\n" +
            "        return self\n" +
            "\n" +
            "class Client:\n" +
            "    def __init__(self, intents=None, command_prefix=None):\n" +
            "        self.intents = intents\n" +
            "        self.user = 'MyBot#0001'\n" +
            "        self.command_prefix = command_prefix or '!'\n" +
            "        self.guilds = []\n" +
            "        self.latency = 0.05\n" +
            "        self._slash = {}\n" +
            "        self._commands = {}\n" +
            "        self._events = {}\n" +
            "        self._token = None\n" +
            "        self.tree = None\n" +
            "\n" +
            "    def run(self, token):\n" +
            "        import discord.ext.commands as _cmds\n" +
            "        _cmds.run_client(self, token)\n" +
            "\n" +
            "    def list_slash(self):\n" +
            "        import discord.ext.commands as _cmds\n" +
            "        return _cmds.client_list_slash(self)\n" +
            "\n" +
            "    async def dispatch_slash(self, name):\n" +
            "        import discord.ext.commands as _cmds\n" +
            "        return await _cmds.client_dispatch_slash(self, name)\n" +
            "\n" +
            "    def event(self, func):\n" +
            "        self._events[func.__name__] = func\n" +
            "        return func\n" +
            "\n",

        "src/lib/discord/ext/async_runner.py":
            "import asyncio\n" +
            "\n" +
            "def run(coro):\n" +
            "    if coro is None:\n" +
            "        return None\n" +
            "    try:\n" +
            "        if hasattr(asyncio, 'run'):\n" +
            "            return asyncio.run(coro)\n" +
            "    except Exception:\n" +
            "        pass\n" +
            "    loop = asyncio.get_event_loop()\n" +
            "    return loop.run_until_complete(coro)\n" +
            "\n" +
            "async def invoke(handler, *args, **kwargs):\n" +
            "    result = handler(*args, **kwargs)\n" +
            "    if result is not None and hasattr(result, '__await__'):\n" +
            "        return await result\n" +
            "    return result\n",

        "src/lib/discord/ui.py":
            "_view_counter = 0\n" +
            "\n" +
            "def _next_view_id():\n" +
            "    global _view_counter\n" +
            "    _view_counter += 1\n" +
            "    return 'view_' + str(_view_counter)\n" +
            "\n" +
            "class View:\n" +
            "    def __init__(self, timeout=180):\n" +
            "        self.timeout = timeout\n" +
            "        self._items = []\n" +
            "        self._view_id = _next_view_id()\n" +
            "        self._collect_items()\n" +
            "        import discord.ext.commands as _cmds\n" +
            "        _cmds._register_view(self._view_id, self)\n" +
            "\n" +
            "    def _collect_items(self):\n" +
            "        for name in dir(self):\n" +
            "            if name.startswith('_'):\n" +
            "                continue\n" +
            "            method = getattr(self, name)\n" +
            "            meta = getattr(method, '_dbs_ui', None)\n" +
            "            if meta:\n" +
            "                item = dict(meta)\n" +
            "                item['callback_name'] = name\n" +
            "                self._items.append(item)\n" +
            "\n" +
            "    def serialize(self):\n" +
            "        out = []\n" +
            "        for item in self._items:\n" +
            "            row = {'type': item['kind'], 'custom_id': item['custom_id'], 'view_id': self._view_id}\n" +
            "            if item['kind'] == 'button':\n" +
            "                row['label'] = item['label']\n" +
            "                row['style'] = item['style']\n" +
            "                if item.get('emoji'):\n" +
            "                    row['emoji'] = item['emoji']\n" +
            "            elif item['kind'] == 'select':\n" +
            "                row['placeholder'] = item['placeholder']\n" +
            "                row['options'] = item['options']\n" +
            "                row['min_values'] = item.get('min_values', 1)\n" +
            "                row['max_values'] = item.get('max_values', 1)\n" +
            "            out.append(row)\n" +
            "        return {'view_id': self._view_id, 'items': out}\n" +
            "\n" +
            "    async def dispatch(self, custom_id, values):\n" +
            "        import discord.ext.async_runner as _ar\n" +
            "        import discord.ext.commands as _cmds\n" +
            "        interaction = _cmds.Interaction(custom_id, values, is_slash=False)\n" +
            "        for item in self._items:\n" +
            "            if item['custom_id'] == custom_id:\n" +
            "                cb = getattr(self, item['callback_name'])\n" +
            "                if item['kind'] == 'button':\n" +
            "                    btn = Button(label=item.get('label'), custom_id=custom_id, style=item.get('style', 1))\n" +
            "                    await _ar.invoke(cb, self, interaction, btn)\n" +
            "                else:\n" +
            "                    sel = Select(custom_id=custom_id, options=[])\n" +
            "                    await _ar.invoke(cb, self, interaction, sel)\n" +
            "                return interaction._responses\n" +
            "        return []\n" +
            "\n" +
            "class Button:\n" +
            "    def __init__(self, label=None, style=1, custom_id=None, emoji=None, url=None, disabled=False):\n" +
            "        self.label = label\n" +
            "        self.style = style\n" +
            "        self.custom_id = custom_id\n" +
            "        self.emoji = emoji\n" +
            "        self.url = url\n" +
            "        self.disabled = disabled\n" +
            "\n" +
            "class Select:\n" +
            "    def __init__(self, custom_id=None, options=None, placeholder='Choose...', min_values=1, max_values=1):\n" +
            "        self.custom_id = custom_id\n" +
            "        self.options = options or []\n" +
            "        self.placeholder = placeholder\n" +
            "        self.min_values = min_values\n" +
            "        self.max_values = max_values\n" +
            "        self.values = []\n" +
            "\n" +
            "def button(label, style=1, custom_id=None, emoji=None, url=None, disabled=False):\n" +
            "    def deco(func):\n" +
            "        func._dbs_ui = {\n" +
            "            'kind': 'button',\n" +
            "            'label': label,\n" +
            "            'style': style,\n" +
            "            'custom_id': custom_id if custom_id else ('btn_' + str(label)),\n" +
            "            'emoji': emoji,\n" +
            "            'url': url,\n" +
            "            'disabled': disabled\n" +
            "        }\n" +
            "        return func\n" +
            "    return deco\n" +
            "\n" +
            "def select(options=None, placeholder='Choose...', min_values=1, max_values=1, custom_id=None):\n" +
            "    def deco(func):\n" +
            "        opts = []\n" +
            "        for o in (options or []):\n" +
            "            if hasattr(o, 'label'):\n" +
            "                opts.append({'label': o.label, 'value': getattr(o, 'value', o.label), 'description': getattr(o, 'description', None)})\n" +
            "            elif isinstance(o, dict):\n" +
            "                opts.append(o)\n" +
            "        func._dbs_ui = {\n" +
            "            'kind': 'select',\n" +
            "            'options': opts,\n" +
            "            'placeholder': placeholder,\n" +
            "            'min_values': min_values,\n" +
            "            'max_values': max_values,\n" +
            "            'custom_id': custom_id if custom_id else 'select_menu'\n" +
            "        }\n" +
            "        return func\n" +
            "    return deco\n",

        "src/lib/discord/app_commands.py":
            "from discord.ext.commands import CommandTree\n",

        "src/lib/discord/ext/__init__.py": "",

        "src/lib/discord/ext/commands.py":
            "import discord\n" +
            "import discord.ext.async_runner as _ar\n" +
            "\n" +
            "__ACTIVE_BOT = None\n" +
            "__VIEW_REGISTRY = {}\n" +
            "\n" +
            "def _register_view(view_id, view_obj):\n" +
            "    __VIEW_REGISTRY[view_id] = view_obj\n" +
            "\n" +
            "def _serialize_embed(embed):\n" +
            "    if embed is None:\n" +
            "        return None\n" +
            "    return {\n" +
            "        'title': getattr(embed, 'title', None),\n" +
            "        'description': getattr(embed, 'description', None),\n" +
            "        'colour': getattr(embed, 'colour', None),\n" +
            "        'fields': getattr(embed, 'fields', []),\n" +
            "        'footer': getattr(embed, 'footer', None)\n" +
            "    }\n" +
            "\n" +
            "class InteractionResponse:\n" +
            "    def __init__(self, interaction):\n" +
            "        self._interaction = interaction\n" +
            "        self._done = False\n" +
            "        self.is_done = lambda: self._done\n" +
            "\n" +
            "    async def send_message(self, content=None, embed=None, view=None, ephemeral=False, delete_after=None):\n" +
            "        if self._done:\n" +
            "            return await self._interaction.followup.send(content, embed=embed, view=view, ephemeral=ephemeral)\n" +
            "        self._done = True\n" +
            "        resp = {\n" +
            "            'content': '' if content is None else str(content),\n" +
            "            'embed': _serialize_embed(embed),\n" +
            "            'ephemeral': ephemeral\n" +
            "        }\n" +
            "        if view is not None:\n" +
            "            resp['view'] = view.serialize()\n" +
            "        self._interaction._responses.append(resp)\n" +
            "        return resp\n" +
            "\n" +
            "    async def defer(self, ephemeral=False, thinking=False):\n" +
            "        self._done = True\n" +
            "        return None\n" +
            "\n" +
            "    async def edit_message(self, content=None, embed=None, view=None):\n" +
            "        self._done = True\n" +
            "        resp = {\n" +
            "            'content': '' if content is None else str(content),\n" +
            "            'embed': _serialize_embed(embed),\n" +
            "            'edit': True\n" +
            "        }\n" +
            "        if view is not None:\n" +
            "            resp['view'] = view.serialize()\n" +
            "        self._interaction._responses.append(resp)\n" +
            "        return resp\n" +
            "\n" +
            "class InteractionFollowup:\n" +
            "    def __init__(self, interaction):\n" +
            "        self._interaction = interaction\n" +
            "\n" +
            "    async def send(self, content=None, embed=None, view=None, ephemeral=False, wait=False):\n" +
            "        resp = {\n" +
            "            'content': '' if content is None else str(content),\n" +
            "            'embed': _serialize_embed(embed),\n" +
            "            'ephemeral': ephemeral\n" +
            "        }\n" +
            "        if view is not None:\n" +
            "            resp['view'] = view.serialize()\n" +
            "        self._interaction._responses.append(resp)\n" +
            "        return resp\n" +
            "\n" +
            "class Interaction:\n" +
            "    def __init__(self, trigger, values=None, is_slash=False):\n" +
            "        self.command_name = trigger if is_slash else None\n" +
            "        self.custom_id = trigger if not is_slash else None\n" +
            "        self.data = {'values': values or []}\n" +
            "        self.user = User('User')\n" +
            "        self.channel = Channel('general')\n" +
            "        self.guild = None\n" +
            "        self.response = InteractionResponse(self)\n" +
            "        self.followup = InteractionFollowup(self)\n" +
            "        self._responses = []\n" +
            "\n" +
            "class User:\n" +
            "    def __init__(self, name, uid='0'):\n" +
            "        self.name = name\n" +
            "        self.display_name = name\n" +
            "        self.id = uid\n" +
            "        self.bot = False\n" +
            "        self.mention = '@' + name\n" +
            "\n" +
            "class Member(User):\n" +
            "    pass\n" +
            "\n" +
            "class Channel:\n" +
            "    def __init__(self, name):\n" +
            "        self.name = name\n" +
            "        self.id = '0'\n" +
            "    async def send(self, content=None, embed=None, view=None):\n" +
            "        return {'content': str(content or ''), 'embed': _serialize_embed(embed)}\n" +
            "\n" +
            "class Message:\n" +
            "    def __init__(self, content, author=None, channel=None):\n" +
            "        self.content = content\n" +
            "        self.author = author or User('User')\n" +
            "        self.channel = channel or Channel('general')\n" +
            "    async def reply(self, content=None, embed=None, view=None, mention_author=False):\n" +
            "        return {'content': str(content or ''), 'embed': _serialize_embed(embed)}\n" +
            "\n" +
            "class Context:\n" +
            "    def __init__(self, message, prefix='!', bot=None):\n" +
            "        self.message = Message(message)\n" +
            "        self.content = message\n" +
            "        self.prefix = prefix\n" +
            "        self.bot = bot\n" +
            "        self.author = User('User')\n" +
            "        self.channel = Channel('general')\n" +
            "        self.guild = None\n" +
            "        self._responses = []\n" +
            "        self.invoked_with = message[len(prefix):].split(' ')[0] if message.startswith(prefix) else ''\n" +
            "        args = message[len(prefix):].strip().split(' ')\n" +
            "        self.args = args[1:] if len(args) > 1 else []\n" +
            "\n" +
            "    async def send(self, content=None, embed=None, view=None, delete_after=None, file=None):\n" +
            "        resp = {\n" +
            "            'content': '' if content is None else str(content),\n" +
            "            'embed': _serialize_embed(embed)\n" +
            "        }\n" +
            "        if view is not None:\n" +
            "            resp['view'] = view.serialize()\n" +
            "        self._responses.append(resp)\n" +
            "        return resp\n" +
            "\n" +
            "    async def reply(self, content=None, embed=None, view=None, mention_author=False):\n" +
            "        return await self.send(content, embed, view)\n" +
            "\n" +
            "class CommandTree:\n" +
            "    def __init__(self, bot):\n" +
            "        self._bot = bot\n" +
            "\n" +
            "    def command(self, name=None, description=''):\n" +
            "        def deco(func):\n" +
            "            cmd = name if name else func.__name__\n" +
            "            self._bot._slash[cmd] = {'description': description, 'func': func}\n" +
            "            return func\n" +
            "        return deco\n" +
            "\n" +
            "    async def sync(self, guild=None):\n" +
            "        return list(self._bot._slash.keys())\n" +
            "\n" +
            "    async def set_command_name(self, command, name):\n" +
            "        return None\n" +
            "\n" +
            "class Bot(discord.Client):\n" +
            "    def __init__(self, command_prefix='!', intents=None, help_command=None):\n" +
            "        discord.Client.__init__(self, intents=intents, command_prefix=command_prefix)\n" +
            "        if isinstance(command_prefix, str):\n" +
            "            self.command_prefix = command_prefix\n" +
            "        elif hasattr(command_prefix, '__call__'):\n" +
            "            self.command_prefix = '!'\n" +
            "            self._prefix_callable = command_prefix\n" +
            "        else:\n" +
            "            self.command_prefix = '!'\n" +
            "        self._commands = {}\n" +
            "        self._slash = {}\n" +
            "        self._events = {}\n" +
            "        self.tree = CommandTree(self)\n" +
            "        self._token = None\n" +
            "        global __ACTIVE_BOT\n" +
            "        __ACTIVE_BOT = self\n" +
            "\n" +
            "    def command(self, name=None, help=None, aliases=None):\n" +
            "        def deco(func):\n" +
            "            cmd = name if name else func.__name__\n" +
            "            self._commands[cmd] = func\n" +
            "            if aliases:\n" +
            "                for a in aliases:\n" +
            "                    self._commands[a] = func\n" +
            "            return func\n" +
            "        return deco\n" +
            "\n" +
            "    def event(self, func):\n" +
            "        self._events[func.__name__] = func\n" +
            "        return func\n" +
            "\n" +
            "    def get_prefix(self, message):\n" +
            "        if hasattr(self, '_prefix_callable'):\n" +
            "            return self._prefix_callable(self, message)\n" +
            "        return self.command_prefix\n" +
            "\n" +
            "    def list_slash(self):\n" +
            "        return client_list_slash(self)\n" +
            "\n" +
            "    async def dispatch_slash(self, name):\n" +
            "        return await client_dispatch_slash(self, name)\n" +
            "\n" +
            "    def run(self, token):\n" +
            "        global __ACTIVE_BOT\n" +
            "        __ACTIVE_BOT = self\n" +
            "        self._token = token\n" +
            "        async def _startup():\n" +
            "            if 'on_ready' in self._events:\n" +
            "                await _ar.invoke(self._events['on_ready'])\n" +
            "            else:\n" +
            "                fn = getattr(self, 'on_ready', None)\n" +
            "                if fn is not None:\n" +
            "                    await _ar.invoke(fn)\n" +
            "        _ar.run(_startup())\n" +
            "\n" +
            "    async def start(self, token):\n" +
            "        self._token = token\n" +
            "        global __ACTIVE_BOT\n" +
            "        __ACTIVE_BOT = self\n" +
            "        if 'on_ready' in self._events:\n" +
            "            await _ar.invoke(self._events['on_ready'])\n" +
            "\n" +
            "    async def close(self):\n" +
            "        return None\n" +
            "\n" +
            "    async def dispatch_prefix(self, text):\n" +
            "        prefix = self.command_prefix\n" +
            "        if not text.startswith(prefix):\n" +
            "            return []\n" +
            "        rest = text[len(prefix):].strip()\n" +
            "        if not rest:\n" +
            "            return []\n" +
            "        parts = rest.split(' ')\n" +
            "        cmd = parts[0].lower()\n" +
            "        if cmd in self._commands:\n" +
            "            ctx = Context(text, prefix, bot=self)\n" +
            "            await _ar.invoke(self._commands[cmd], ctx)\n" +
            "            return ctx._responses\n" +
            "        return []\n" +
            "\n" +
            "async def _dispatch_component_async(view_id, custom_id, values):\n" +
            "    view = __VIEW_REGISTRY.get(view_id)\n" +
            "    if view is None:\n" +
            "        return []\n" +
            "    return await view.dispatch(custom_id, values)\n" +
            "\n" +
            "def dispatch_component(view_id, custom_id, values):\n" +
            "    return _ar.run(_dispatch_component_async(view_id, custom_id, values))\n" +
            "\n" +
            "def get_active_bot():\n" +
            "    return __ACTIVE_BOT\n" +
            "\n" +
            "def set_active_bot(bot):\n" +
            "    global __ACTIVE_BOT\n" +
            "    __ACTIVE_BOT = bot\n" +
            "\n" +
            "def run_client(client, token):\n" +
            "    global __ACTIVE_BOT\n" +
            "    __ACTIVE_BOT = client\n" +
            "    client._token = token\n" +
            "    if not hasattr(client, '_slash') or client._slash is None:\n" +
            "        client._slash = {}\n" +
            "    if not hasattr(client, '_commands') or client._commands is None:\n" +
            "        client._commands = {}\n" +
            "    if not hasattr(client, '_events') or client._events is None:\n" +
            "        client._events = {}\n" +
            "    async def _startup():\n" +
            "        fn = getattr(client, 'on_ready', None)\n" +
            "        if fn is not None:\n" +
            "            await _ar.invoke(fn)\n" +
            "        elif 'on_ready' in client._events:\n" +
            "            await _ar.invoke(client._events['on_ready'])\n" +
            "    _ar.run(_startup())\n" +
            "    __ACTIVE_BOT = client\n" +
            "\n" +
            "def client_list_slash(client):\n" +
            "    out = []\n" +
            "    slash = getattr(client, '_slash', {})\n" +
            "    if slash is None:\n" +
            "        slash = {}\n" +
            "    for k in list(slash.keys()):\n" +
            "        entry = slash[k]\n" +
            "        desc = ''\n" +
            "        if entry is not None and 'description' in entry:\n" +
            "            desc = entry['description']\n" +
            "        out.append({'name': k, 'description': desc})\n" +
            "    return out\n" +
            "\n" +
            "async def client_dispatch_slash(client, name):\n" +
            "    slash = getattr(client, '_slash', {})\n" +
            "    if name not in slash:\n" +
            "        return []\n" +
            "    interaction = Interaction(name, is_slash=True)\n" +
            "    await _ar.invoke(slash[name]['func'], interaction)\n" +
            "    return interaction._responses\n"
    };

    function injectSkulptModules() {
        if (!global.Sk || !global.Sk.builtinFiles) return;
        var files = global.Sk.builtinFiles.files || global.Sk.builtinFiles["files"];
        if (!files) return;
        Object.keys(MOCK_SOURCES).forEach(function (path) {
            files[path] = MOCK_SOURCES[path];
        });
    }

    global.DiscordPyMock = {
        inject: injectSkulptModules,
        DEMO_BOT_CODE:
            "# main.py — 與 VS Code 執行 python main.py 相同結構\n" +
            "import discord\n" +
            "from discord.ext import commands\n" +
            "from discord import ui\n" +
            "\n" +
            "TOKEN = 'YOUR_BOT_TOKEN'  # 你的固定 Token（平台上會自動填入）\n" +
            "\n" +
            "intents = discord.Intents.default()\n" +
            "intents.message_content = True\n" +
            "bot = commands.Bot(command_prefix='!', intents=intents)\n" +
            "\n" +
            "@bot.event\n" +
            "async def on_ready():\n" +
            "    print(f'Logged in as {bot.user}')\n" +
            "    synced = await bot.tree.sync()\n" +
            "    print(f'Synced {len(synced)} slash command(s)')\n" +
            "\n" +
            "@bot.command(name='hello')\n" +
            "async def hello(ctx):\n" +
            "    await ctx.send('你好！我是 Discord Bot 👋')\n" +
            "\n" +
            "@bot.command(name='ping')\n" +
            "async def ping(ctx):\n" +
            "    await ctx.send('pong 🏓')\n" +
            "\n" +
            "@bot.tree.command(name='ping', description='測試 Bot 延遲')\n" +
            "async def slash_ping(interaction):\n" +
            "    await interaction.response.send_message('Pong! ⚡')\n" +
            "\n" +
            "@bot.tree.command(name='hello', description='打招呼')\n" +
            "async def slash_hello(interaction):\n" +
            "    await interaction.response.send_message('你好！這是 /hello 斜線指令')\n" +
            "\n" +
            "class MenuView(ui.View):\n" +
            "    @ui.button(label='確認', style=discord.ButtonStyle.success, custom_id='confirm_btn')\n" +
            "    async def confirm(self, interaction, button):\n" +
            "        await interaction.response.send_message('你已按下確認 ✅', ephemeral=True)\n" +
            "\n" +
            "    @ui.button(label='取消', style=discord.ButtonStyle.danger, custom_id='cancel_btn')\n" +
            "    async def cancel(self, interaction, button):\n" +
            "        await interaction.response.send_message('已取消 ❌', ephemeral=True)\n" +
            "\n" +
            "    @ui.select(\n" +
            "        placeholder='選擇一個選項…',\n" +
            "        options=[\n" +
            "            discord.SelectOption(label='蘋果', value='apple'),\n" +
            "            discord.SelectOption(label='香蕉', value='banana'),\n" +
            "            discord.SelectOption(label='櫻桃', value='cherry'),\n" +
            "        ],\n" +
            "        custom_id='fruit_select'\n" +
            "    )\n" +
            "    async def fruit_select(self, interaction, select):\n" +
            "        val = interaction.data['values'][0]\n" +
            "        await interaction.response.send_message('你選了：' + val)\n" +
            "\n" +
            "@bot.command(name='menu')\n" +
            "async def menu_cmd(ctx):\n" +
            "    await ctx.send('請選擇：', view=MenuView())\n" +
            "\n" +
            "bot.run(TOKEN)\n"
    };
})(typeof window !== "undefined" ? window : globalThis);
