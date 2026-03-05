const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../src/utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('밴된 유저를 언밴합니다.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption((opt) =>
      opt.setName('userid').setDescription('언밴할 유저 ID').setRequired(true),
    )
    .addStringOption((opt) =>
      opt.setName('reason').setDescription('사유').setRequired(false),
    ),

  async execute(interaction) {
    const userId = interaction.options.getString('userid');
    const reason = interaction.options.getString('reason') ?? '사유 없음';

    // ID 형식 검사
    if (!/^\d{17,20}$/.test(userId))
      return interaction.reply({ embeds: [errorEmbed('올바른 유저 ID를 입력해주세요. (17~20자리 숫자)')], flags: ['Ephemeral'] });

    // 밴 목록에서 확인
    const ban = await interaction.guild.bans.fetch(userId).catch(() => null);
    if (!ban)
      return interaction.reply({ embeds: [errorEmbed('해당 유저는 밴 목록에 없습니다.')], flags: ['Ephemeral'] });

    await interaction.guild.members.unban(userId, reason);

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('🔓 멤버 언밴')
          .addFields(
            { name: '대상', value: `${ban.user.tag} (${userId})`, inline: true },
            { name: '사유', value: reason, inline: false },
          )
          .setColor(0x57f287)
          .setTimestamp(),
      ],
    });
  },
};
