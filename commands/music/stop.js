const { SlashCommandBuilder } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../src/utils/embed');

module.exports = {
  data: new SlashCommandBuilder().setName('stop').setDescription('음악을 중지하고 채널에서 나갑니다.'),
  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guild.id);
    if (!queue) return interaction.reply({ embeds: [errorEmbed('재생 중인 음악이 없습니다.')], ephemeral: true });
    if (!interaction.member.voice.channel) return interaction.reply({ embeds: [errorEmbed('음성 채널에 입장해주세요.')], ephemeral: true });
    try {
      await interaction.client.distube.stop(interaction.guild.id);
      await interaction.reply({ embeds: [successEmbed('음악을 중지했습니다.')] });
    } catch (err) { await interaction.reply({ embeds: [errorEmbed(err.message)], ephemeral: true }); }
  },
};