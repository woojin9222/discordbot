const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('유저 정보를 표시합니다.')
    .addUserOption((opt) =>
      opt.setName('user').setDescription('조회할 유저 (기본: 본인)').setRequired(false),
    ),

  async execute(interaction) {
    const user   = interaction.options.getUser('user') ?? interaction.user;
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    const roles = member?.roles.cache
      .filter((r) => r.id !== interaction.guild.id)
      .sort((a, b) => b.position - a.position)
      .map((r) => `${r}`)
      .slice(0, 10)
      .join(' ') || '없음';

    const joinedAt  = member?.joinedAt
      ? `<t:${Math.floor(member.joinedAt / 1000)}:D>`
      : '알 수 없음';
    const createdAt = `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`;

    const embed = new EmbedBuilder()
      .setTitle(`${user.username} 정보`)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .setColor(member?.displayColor || 0x5865f2)
      .addFields(
        { name: '🆔 유저 ID',     value: user.id,                                    inline: true  },
        { name: '🏷️ 닉네임',      value: member?.displayName ?? user.username,        inline: true  },
        { name: '🤖 봇 여부',     value: user.bot ? '예' : '아니오',                  inline: true  },
        { name: '📅 계정 생성일', value: createdAt,                                   inline: true  },
        { name: '📥 서버 가입일', value: joinedAt,                                    inline: true  },
        { name: `🎭 역할 (${member?.roles.cache.size - 1 || 0}개)`, value: roles,     inline: false },
      )
      .setFooter({ text: `요청자: ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
