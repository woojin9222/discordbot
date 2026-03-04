const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('명령어 목록을 표시합니다.'),

  async execute(interaction) {
    const helpEmbed = new EmbedBuilder()
      .setTitle('📖 명령어 목록')
      .setColor(0x5865f2)
      .addFields(
        {
          name: '🔧 기본',
          value: '`/ping` - 봇 지연시간 확인\n`/help` - 명령어 목록',
        },
        {
          name: '🎵 음악',
          value:
            '`/play <url>` - 음악 재생\n`/skip` - 현재 곡 스킵\n`/stop` - 재생 중지\n`/queue` - 재생목록 확인\n`/np` - 현재 재생 중인 곡\n`/volume <0-100>` - 볼륨 조절\n`/pause` - 일시정지\n`/resume` - 재개',
        },
        {
          name: '🛡️ 관리',
          value:
            '`/kick <멤버> [사유]` - 멤버 킥\n`/ban <멤버> [사유]` - 멤버 밴\n`/unban <유저ID>` - 언밴\n`/mute <멤버> [사유]` - 타임아웃(1시간)\n`/unmute <멤버>` - 타임아웃 해제\n`/clear <개수>` - 메시지 삭제',
        },
      );

    await interaction.reply({ embeds: [helpEmbed] });
  },
};
