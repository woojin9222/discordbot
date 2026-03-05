const { SlashCommandBuilder } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../src/utils/embed');

module.exports = {
  data: new SlashCommandBuilder().setName('skip').setDescription('현재 곡을 스킵합니다.'),
  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guild.id);
    if (!queue) return interaction.reply({ embeds: [errorEmbed('재생 중인 음악이 없습니다.')], flags: ['Ephemeral'] });
    if (!interaction.member.voice.channel) return interaction.reply({ embeds: [errorEmbed('음성 채널에 입장해주세요.')], flags: ['Ephemeral'] });
    try {
      await interaction.client.distube.skip(interaction.guild.id);
      await interaction.reply({ embeds: [successEmbed('현재 곡을 스킵했습니다.')] });
    } catch (err) { await interaction.reply({ embeds: [errorEmbed(err.message)], flags: ['Ephemeral'] }); }
  },
};
