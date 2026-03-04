const { SlashCommandBuilder } = require('discord.js');
const { embed, errorEmbed } = require('../../src/utils/embed');

module.exports = {
  data: new SlashCommandBuilder().setName('queue').setDescription('재생목록을 표시합니다.'),
  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guild.id);
    if (!queue?.songs?.length) return interaction.reply({ embeds: [errorEmbed('재생목록이 비어있습니다.')], ephemeral: true });
    const list = queue.songs.slice(0, 10)
      .map((s, i) => `**${i + 1}.** [${s.name}](${s.url}) — ${s.formattedDuration}`)
      .join('\n');
    const suffix = queue.songs.length > 10 ? `\n\n...외 ${queue.songs.length - 10}곡` : '';
    await interaction.reply({ embeds: [embed('📋 재생목록', list + suffix)] });
  },
};