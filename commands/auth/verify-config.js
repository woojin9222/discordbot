const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify-config')
    .setDescription('현재 인증 설정을 확인합니다. (관리자 전용)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('⚙️ 인증 설정 안내')
          .setColor(0x5865f2)
          .setDescription(
            '인증 역할과 채널은 `.env` 파일이 아닌\n`/verify-setup` 명령어로 직접 설정합니다.',
          )
          .addFields(
            {
              name: '📋 사용 방법',
              value: [
                '`/verify-setup role:@역할` — 인증 패널 생성',
                '`panel_channel` — 패널을 보낼 채널 (기본: 현재 채널)',
                '`verified_channel` — 인증 후 접근 허용할 채널',
                '`title` / `description` — 패널 문구 커스텀',
              ].join('\n'),
            },
            {
              name: '💡 특징',
              value: [
                '• DB 없이 버튼에 설정이 인코딩됨',
                '• 여러 채널에 다른 역할의 패널 동시 운영 가능',
                '• 봇 재시작 후에도 인증 버튼 유지',
              ].join('\n'),
            },
          )
          .setFooter({ text: '궁금한 점이 있으면 /help 를 참고하세요.' }),
      ],
      flags: ['Ephemeral'],
    });
  },
};
