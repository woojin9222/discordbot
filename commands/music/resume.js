const { SlashCommandBuilder } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../src/utils/embed');

module.exports = {
  data: new SlashCommandBuilder().setName('resume').setDescription('일시정지된 음악을 재개합니다.'),
  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guild.id);
    if (!queue) return interaction.reply({ embeds: [errorEmbed('재생 중인 음악이 없습니다.')], ephemeral: true });
    try {
      interaction.client.distube.resume(interaction.guild.id);
      await interaction.reply({ embeds: [successEmbed('재생을 재개합니다.')] });
    } catch (err) { await interaction.reply({ embeds: [errorEmbed(err.message)], ephemeral: true }); }
  },
};