const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../src/utils/embed');

const TIME_OPTIONS = [
  { name: '60초', value: 60 },
  { name: '5분',  value: 300 },
  { name: '10분', value: 600 },
  { name: '30분', value: 1800 },
  { name: '1시간', value: 3600 },
  { name: '12시간', value: 43200 },
  { name: '1일',  value: 86400 },
  { name: '1주일', value: 604800 },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('멤버를 타임아웃합니다.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) =>
      opt.setName('target').setDescription('타임아웃할 멤버').setRequired(true),
    )
    .addIntegerOption((opt) =>
      opt.setName('duration').setDescription('타임아웃 시간 (기본: 1시간)').setRequired(false)
        .addChoices(...TIME_OPTIONS),
    )
    .addStringOption((opt) =>
      opt.setName('reason').setDescription('사유').setRequired(false),
    ),

  async execute(interaction) {
    const target   = interaction.options.getMember('target');
    const duration = interaction.options.getInteger('duration') ?? 3600;
    const reason   = interaction.options.getString('reason') ?? '사유 없음';

    if (!target)
      return interaction.reply({ embeds: [errorEmbed('해당 멤버를 찾을 수 없습니다.')], flags: ['Ephemeral'] });
    if (!target.moderatable)
      return interaction.reply({ embeds: [errorEmbed('해당 멤버를 타임아웃할 권한이 없습니다.')], flags: ['Ephemeral'] });
    if (target.id === interaction.user.id)
      return interaction.reply({ embeds: [errorEmbed('자기 자신을 타임아웃할 수 없습니다.')], flags: ['Ephemeral'] });

    await target.timeout(duration * 1000, reason);

    const label = TIME_OPTIONS.find((t) => t.value === duration)?.name ?? `${duration}초`;

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('🔇 타임아웃')
          .addFields(
            { name: '대상',   value: `${target} (${target.user.tag})`, inline: true },
            { name: '시간',   value: label,                             inline: true },
            { name: '사유',   value: reason,                            inline: false },
          )
          .setColor(0xfee75c)
          .setTimestamp(),
      ],
    });
  },
};
