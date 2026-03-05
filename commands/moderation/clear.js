const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { errorEmbed } = require('../../src/utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('메시지를 일괄 삭제합니다.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((opt) =>
      opt.setName('amount').setDescription('삭제할 메시지 개수 (1~100)').setRequired(true).setMinValue(1).setMaxValue(100),
    )
    .addUserOption((opt) =>
      opt.setName('target').setDescription('특정 유저의 메시지만 삭제').setRequired(false),
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const target = interaction.options.getUser('target');

    await interaction.deferReply({ flags: ['Ephemeral'] });

    // 메시지 fetch 후 필터링
    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    let toDelete = [...messages.values()].slice(0, amount);

    if (target) toDelete = toDelete.filter((m) => m.author.id === target.id);

    // 14일 이상 된 메시지는 bulkDelete 불가 — 필터링
    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    toDelete = toDelete.filter((m) => m.createdTimestamp > twoWeeksAgo);

    if (!toDelete.length)
      return interaction.editReply({ embeds: [errorEmbed('삭제할 수 있는 메시지가 없습니다.\n(14일 이상 된 메시지는 삭제할 수 없습니다.)')] });

    const deleted = await interaction.channel.bulkDelete(toDelete, true);

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle('🗑️ 메시지 삭제')
          .setDescription(`**${deleted.size}**개의 메시지를 삭제했습니다.` + (target ? `\n대상: ${target}` : ''))
          .setColor(0x57f287)
          .setTimestamp(),
      ],
    });
  },
};
