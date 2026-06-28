const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ChannelType, PermissionsBitField, SlashCommandBuilder, REST, Routes } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const STAFF_ROLE_ID = '1520692929234997358';
const MM_ROLES = {
    'official': '1520693156541370389',
    'trial': '1520693814476410940',
    'pvp': '1520694154340859989'
};

// Definirea comenzilor
const commands = [
    new SlashCommandBuilder().setName('setup-support').setDescription('Configurează panel-ul de Support'),
    new SlashCommandBuilder().setName('setup-mm').setDescription('Configurează panel-ul de Middleman')
].map(command => command.toJSON());

// Înregistrarea comenzilor la pornire
client.once('ready', async () => {
    const rest = new REST({ version: '10' }).setToken('TOKEN_UL_TAU_AICI');
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('Slash Commands înregistrate cu succes!');
    } catch (error) { console.error(error); }
});

// Gestionarea comenzilor /
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'setup-support') {
            const embed = new EmbedBuilder().setColor('#3498db').setTitle('Levelo Community - Support').setDescription('Alege tipul de suport:');
            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId('select_support').setPlaceholder('Alege categoria...')
                .addOptions([
                    { label: 'General Support', value: 'support' },
                    { label: 'Purchase', value: 'purchase' }
                ])
            );
            await interaction.reply({ embeds: [embed], components: [row] });
        }

        if (interaction.commandName === 'setup-mm') {
            const embed = new EmbedBuilder().setColor('#e67e22').setTitle('Levelo Community - Middleman').setDescription('Alege rangul de MM necesar:');
            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId('select_mm').setPlaceholder('Alege tipul de MM...')
                .addOptions([
                    { label: 'Official MM', value: 'mm_official' },
                    { label: 'Trial MM', value: 'mm_trial' },
                    { label: 'PVP MM', value: 'mm_pvp' }
                ])
            );
            await interaction.reply({ embeds: [embed], components: [row] });
        }
    }

    // Gestionarea meniurilor (Ticket logic)
    if (interaction.isStringSelectMenu()) {
        const value = interaction.values[0];
        let roleToPing = STAFF_ROLE_ID;
        if (value.startsWith('mm_')) {
            const type = value.split('_')[1];
            roleToPing = MM_ROLES[type];
        }

        const channel = await interaction.guild.channels.create({
            name: `${value}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                { id: roleToPing, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
            ]
        });

        await interaction.reply({ content: `Ticket deschis: ${channel}`, ephemeral: true });
        await channel.send(`Salut <@${interaction.user.id}>! Un membru al staff-ului te va ajuta în curând. <@&${roleToPing}>`);
    }
});

client.login(process.env.TOKEN);

              
