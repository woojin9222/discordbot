const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('유저의 프로필 사진을 크게 표시합니다.')
    .addUserOption((opt) =>
      opt.setName('user').setDescription('조회할 유저 (기본: 본인)').setRequired(false),
    ),

  async execute(interaction) {
    const user   = interaction.options.getUser('user') ?? interaction.user;
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    // 서버 아바타 (있으면) + 글로벌 아바타 둘 다 표시
    const globalAvatar = user.displayAvatarURL({ size: 1024, extension: 'png' });
    const serverAvatar = member?.displayAvatarURL({ size: 1024, extension: 'png' });

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}의 프로필 사진`)
      .setImage(serverAvatar ?? globalAvatar)
      .setColor(0x5865f2)
      .setFooter({ text: '링크를 클릭하면 원본을 볼 수 있습니다.' });

    if (serverAvatar && serverAvatar !== globalAvatar) {
      embed.addFields({ name: '🌐 글로벌 아바타', value: `[링크](${globalAvatar})`, inline: true });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
