const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} = require('discord.js');
const { errorEmbed } = require('../../src/utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify-setup')
    .setDescription('인증 패널을 생성합니다. (관리자 전용)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption((opt) =>
      opt.setName('role').setDescription('✅ 인증 성공 시 부여할 역할').setRequired(true),
    )
    .addChannelOption((opt) =>
      opt
        .setName('panel_channel')
        .setDescription('인증 패널을 보낼 채널 (기본: 현재 채널)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false),
    )
    .addChannelOption((opt) =>
      opt
        .setName('verified_channel')
        .setDescription('인증 후 접근 허용할 채널 (없으면 역할만 부여)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false),
    )
    .addStringOption((opt) =>
      opt.setName('title').setDescription('패널 제목 (기본: ✅ 서버 인증)').setRequired(false),
    )
    .addStringOption((opt) =>
      opt.setName('description').setDescription('패널 설명').setRequired(false),
    ),

  async execute(interaction) {
    const role         = interaction.options.getRole('역할');
    const panelChannel = interaction.options.getChannel('채널') ?? interaction.channel;
    const verifiedCh   = interaction.options.getChannel('인증채널');
    const title        = interaction.options.getString('제목') ?? '✅ 서버 인증';
    const description  = interaction.options.getString('설명') ??
      '아래 **인증하기** 버튼을 클릭하면\n자동으로 멤버 역할이 부여됩니다.';

    // 봇이 해당 역할을 부여할 수 있는지 사전 검사
    const botMember = interaction.guild.members.me;
    if (role.position >= botMember.roles.highest.position) {
      return interaction.reply({
        embeds: [errorEmbed(
          `봇의 역할이 **${role.name}** 보다 낮거나 같아서 역할을 부여할 수 없습니다.\n` +
          '서버 설정 → 역할에서 봇 역할을 인증 역할보다 위로 올려주세요.',
        )],
        ephemeral: true,
      });
    }

    // 설정값을 customId에 인코딩 (DB 없이 상태 유지)
    // 형식: verify_button:ROLE_ID:CHANNEL_ID (채널 없으면 none)
    const customId = `verify_button:${role.id}:${verifiedCh?.id ?? 'none'}`;

    const panelEmbed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(0x5865f2)
      .addFields({ name: '부여 역할', value: `${role}`, inline: true })
      .setFooter({ text: '버튼을 클릭하면 인증이 완료됩니다.' })
      .setTimestamp();

    if (verifiedCh) {
      panelEmbed.addFields({ name: '인증 후 접근 채널', value: `${verifiedCh}`, inline: true });
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(customId)
        .setLabel('✅ 인증하기')
        .setStyle(ButtonStyle.Success),
    );

    await panelChannel.send({ embeds: [panelEmbed], components: [row] });

    // 관리자에게 결과 요약 (ephemeral)
    const summaryEmbed = new EmbedBuilder()
      .setTitle('📨 인증 패널 생성 완료')
      .setColor(0x57f287)
      .addFields(
        { name: '패널 채널', value: `${panelChannel}`, inline: true },
        { name: '인증 역할', value: `${role}`, inline: true },
        { name: '접근 채널', value: verifiedCh ? `${verifiedCh}` : '미설정 (역할만 부여)', inline: true },
      );

    await interaction.reply({ embeds: [summaryEmbed], ephemeral: true });
  },
};