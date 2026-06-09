# Discord Bot — 與 Doratch 平台相同語法
# VS Code 使用方式：
#   1. pip install discord.py
#   2. 將下方 TOKEN 改成 Discord Developer Portal 的真 Token
#   3. python main.py

import discord
from discord.ext import commands
from discord import ui

TOKEN = "YOUR_BOT_TOKEN"

intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="!", intents=intents)


@bot.event
async def on_ready():
    print(f"Logged in as {bot.user}")
    try:
        await bot.tree.sync()
    except Exception as e:
        print("tree.sync:", e)


@bot.command(name="hello")
async def hello(ctx):
    await ctx.send("你好！我是 Discord Bot 👋")


@bot.command(name="ping")
async def ping(ctx):
    await ctx.send("pong 🏓")


@bot.tree.command(name="ping", description="測試 Bot 延遲")
async def slash_ping(interaction):
    await interaction.response.send_message("Pong! ⚡")


class MenuView(ui.View):
    @ui.button(label="確認", style=discord.ButtonStyle.success, custom_id="confirm_btn")
    async def confirm(self, interaction, button):
        await interaction.response.send_message("你已按下確認 ✅", ephemeral=True)

    @ui.select(
        placeholder="選水果…",
        options=[
            discord.SelectOption(label="蘋果", value="apple"),
            discord.SelectOption(label="香蕉", value="banana"),
        ],
        custom_id="fruit_select",
    )
    async def fruit_select(self, interaction, select):
        val = interaction.data["values"][0]
        await interaction.response.send_message(f"你選了：{val}")


@bot.command(name="menu")
async def menu_cmd(ctx):
    await ctx.send("請選擇：", view=MenuView())


bot.run(TOKEN)
