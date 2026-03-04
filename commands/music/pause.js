const { SlashCommandBuilder } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../src/utils/embed');

module.exports = {
  data: new SlashCommandBuilder().setName('pause').setDescription('음악을 일시정지합니다.'),
  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guild.id);
    if (!queue) return interaction.reply({ embeds: [errorEmbed('재생 중인 음악이 없습니다.')], ephemeral: true });
    try {
      interaction.client.distube.pause(interaction.guild.id);
      await interaction.reply({ embeds: [successEmbed('일시정지했습니다.')] });
    } catch (err) { await interaction.reply({ embeds: [errorEmbed(err.message)], ephemeral: true }); }
  },
};