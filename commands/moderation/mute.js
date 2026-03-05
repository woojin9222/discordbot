const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../src/utils/embed');

const UNITS = {
  초: 1,
  분: 60,
  시간: 3600,
  일: 86400,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('멤버를 타임아웃합니다.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) =>
      opt.setName('target').setDescription('타임아웃할 멤버').setRequired(true),
    )
    .addIntegerOption((opt) =>
      opt.setName('duration').setDescription('타임아웃 시간 (숫자)').setRequired(true).setMinValue(1),
    )
    .addStringOption((opt) =>
      opt.setName('unit').setDescription('단위 (기본: 분)').setRequired(false)
        .addChoices(
          { name: '초', value: '초' },
          { name: '분', value: '분' },
          { name: '시간', value: '시간' },
          { name: '일', value: '일' },
        ),
    )
    .addStringOption((opt) =>
      opt.setName('reason').setDescription('사유').setRequired(false),
    ),

  async execute(interaction) {
    const target   = interaction.options.getMember('target');
    const duration = interaction.options.getInteger('duration');
    const unit     = interaction.options.getString('unit') ?? '분';
    const reason   = interaction.options.getString('reason') ?? '사유 없음';

    if (!target)
      return interaction.reply({ embeds: [errorEmbed('해당 멤버를 찾을 수 없습니다.')], flags: ['Ephemeral'] });
    if (!target.moderatable)
      return interaction.reply({ embeds: [errorEmbed('해당 멤버를 타임아웃할 권한이 없습니다.\n봇 역할이 대상보다 높은지 확인해주세요.')], flags: ['Ephemeral'] });
    if (target.id === interaction.user.id)
      return interaction.reply({ embeds: [errorEmbed('자기 자신을 타임아웃할 수 없습니다.')], flags: ['Ephemeral'] });

    const seconds = duration * UNITS[unit];

    // Discord 최대 타임아웃: 28일
    if (seconds > 28 * 86400)
      return interaction.reply({ embeds: [errorEmbed('타임아웃은 최대 **28일**까지 설정할 수 있습니다.')], flags: ['Ephemeral'] });

    await target.timeout(seconds * 1000, reason);

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('🔇 타임아웃')
          .addFields(
            { name: '대상', value: `${target} (${target.user.tag})`, inline: true },
            { name: '시간', value: `${duration}${unit}`,             inline: true },
            { name: '사유', value: reason,                           inline: false },
          )
          .setColor(0xfee75c)
          .setTimestamp(),
      ],
    });
  },
};