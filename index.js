const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');

// 1. Inițializare Client cu toate intențiile necesare
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildInvites
    ]
});

// Cache pentru a memora numărul de invitații
const invitesCache = new Map();

// 2. Înregistrarea comenzilor Slash
const commands = [
    new SlashCommandBuilder()
        .setName('invites')
        .setDescription('Verifică câte invitații ai făcut')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken('TOKEN');

client.once('ready', async () => {
    console.log(`Botul ${client.user.tag} este pornit!`);

    // Înregistrare comenzi
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('Comenzile au fost înregistrate.');
    } catch (error) {
        console.error(error);
    }

    // Încărcare invitații curente în cache
    client.guilds.cache.forEach(async (guild) => {
        const firstInvites = await guild.invites.fetch();
        invitesCache.set(guild.id, new Map(firstInvites.map(i => [i.code, i.uses])));
    });
});

// 3. Logica de detectare a invitațiilor noi
client.on('guildMemberAdd', async (member) => {
    const guildInvites = await member.guild.invites.fetch();
    const cachedInvites = invitesCache.get(member.guild.id);
    
    // Găsim invitația care a crescut ca număr de utilizări
    const newInvite = guildInvites.find(i => i.uses > (cachedInvites.get(i.code) || 0));

    if (newInvite) {
        console.log(`${member.user.tag} a fost invitat de ${newInvite.inviter.tag}`);
        // Aici poți salva în baza de date numărul de invitații al lui newInvite.inviter.id
        
        // Actualizăm cache-ul
        cachedInvites.set(newInvite.code, newInvite.uses);
    }
});

// 4. Răspuns la comanda /invites
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'invites') {
        // Aici ar trebui să interoghezi baza de date cu interaction.user.id
        await interaction.reply(`Ai făcut un total de X invitații!`);
    }
});

client.login('TOKEN');
