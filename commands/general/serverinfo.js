const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('서버 정보를 표시합니다.'),

  async execute(interaction) {
    const guild = interaction.guild;
    await guild.fetch();

    const owner      = await guild.fetchOwner().catch(() => null);
    const createdAt  = `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`;
    const boostLevel = ['없음', '레벨 1', '레벨 2', '레벨 3'][guild.premiumTier] ?? '알 수 없음';

    const channels = guild.channels.cache;
    const textCh   = channels.filter((c) => c.type === 0).size;
    const voiceCh  = channels.filter((c) => c.type === 2).size;

    const embed = new EmbedBuilder()
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL({ size: 256 }))
      .setColor(0x5865f2)
      .addFields(
        { name: '🆔 서버 ID',      value: guild.id,                                         inline: true  },
        { name: '👑 서버 오너',    value: owner?.user.tag ?? '알 수 없음',                   inline: true  },
        { name: '📅 생성일',       value: createdAt,                                         inline: true  },
        { name: '👥 멤버 수',      value: `${guild.memberCount}명`,                          inline: true  },
        { name: '💬 채널',         value: `텍스트 ${textCh}개 / 음성 ${voiceCh}개`,          inline: true  },
        { name: '🎭 역할 수',      value: `${guild.roles.cache.size}개`,                     inline: true  },
        { name: '🚀 부스트',       value: `${boostLevel} (${guild.premiumSubscriptionCount}개)`, inline: true },
        { name: '😀 이모지',       value: `${guild.emojis.cache.size}개`,                    inline: true  },
      )
      .setFooter({ text: `요청자: ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
