const { EmbedBuilder } = require('discord.js');

function embed(title, description, color = 0x5865f2) {
  return new EmbedBuilder().setTitle(title).setDescription(description).setColor(color);
}

function errorEmbed(description) {
  return embed('❌ 오류', description, 0xed4245);
}

function successEmbed(description) {
  return embed('✅ 완료', description, 0x57f287);
}

module.exports = { embed, errorEmbed, successEmbed };
