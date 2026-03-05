const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('명령어 목록을 표시합니다.'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📖 명령어 목록')
      .setColor(0x5865f2)
      .addFields(
        {
          name: '🔧 기본',
          value: [
            '`/ping` 봇 지연시간 확인',
            '`/help` 명령어 목록',
            '`/userinfo [유저]` 유저 정보',
            '`/serverinfo` 서버 정보',
            '`/avatar [유저]` 프로필 사진',
          ].join('\n'),
        },
        {
          name: '🎵 음악',
          value: [
            '`/play <검색어·URL>` YouTube / Spotify 재생',
            '`/skip` 현재 곡 스킵',
            '`/stop` 재생 중지 및 퇴장',
            '`/queue` 재생목록 확인',
            '`/np` 현재 재생 중인 곡',
            '`/pause` 일시정지',
            '`/resume` 재개',
            '`/volume <0~100>` 볼륨 조절',
          ].join('\n'),
        },
        {
          name: '🛡️ 관리',
          value: [
            '`/kick <멤버> [사유]` 킥',
            '`/ban <멤버> [사유]` 밴',
            '`/unban <유저ID>` 언밴',
            '`/mute <멤버> [시간] [사유]` 타임아웃',
            '`/unmute <멤버>` 타임아웃 해제',
            '`/clear <개수>` 메시지 일괄 삭제',
            '`/lock [채널] [사유]` 채널 잠금',
            '`/unlock [채널]` 채널 잠금 해제',
            '`/setlog set|off|status` 로그 채널 설정',
          ].join('\n'),
        },
        {
          name: '✅ 인증',
          value: [
            '`/verify-setup` 인증 패널 생성 (관리자)',
            '`/verify-config` 인증 설정 확인 (관리자)',
          ].join('\n'),
        },
      )
      .setFooter({ text: `요청자: ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
