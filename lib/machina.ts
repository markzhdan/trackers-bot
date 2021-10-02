import 'discord.js'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { ApplicationCommand, ApplicationCommandPermissionData, ButtonInteraction, Client, Collection, CommandInteraction, ContextMenuInteraction, Intents, Interaction, MessageComponentInteraction, SelectMenuInteraction } from 'discord.js'
import * as fs from 'fs'
import { SlashCommandBuilder } from '@discordjs/builders'
import { sleep } from './util'
import path from 'path'

/** Main class that handles command updates and starting the bot */
export class Machina {
    token: string
    rest: REST
    client: Client & {commands?: Collection<String,Machi>}
    client_id: string 
    guild_id: string
    loggedIn: boolean 

    /**
     * Makes an instance of the Machina class
     * @param TOKEN Token of the bot
     * @param client_id ID of the bot
     * @param guild_id The SINGLE guild you want your commands to go under
     */
    constructor(TOKEN: string, client_id: string, guild_id: string, ...extraIntenets: number[]) {
        this.token = TOKEN;
        this.client_id = client_id
        this.guild_id = guild_id
        this.rest = new REST({version: '9'}).setToken(this.token)
        this.client = new Client({intents: [Intents.FLAGS.GUILDS, ...extraIntenets]})
    }

    /** Starts the bot */
    start() {
        if(!this.client.commands) // Checks to see if the commands have already been added
            this.reloadCommands() // If not, then reload (technically load in this case) the commands

        this.client.once('ready', () => { // Once the bot has connected to discord
            console.log('Bot Online!') // log that the bot is online
        })
        this.client.on('interactionCreate', async interaction => { // Listen to when a user either runs a command, or responds to a command 
            if (interaction.isCommand()) { // If its a command 
                const command = this.client.commands.get(interaction.commandName) // Check to see if the command they ran corresponds to a command in the cache
                if (!command) return // If not, return 
            
                try { 
                    await command.execute(interaction, this) // Try to run the command 
                } catch (error) {
                    console.error(error) // If there is an error, log it out
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true }) // Reply to the user saying that there was an error
                }
            } else if(interaction.isMessageComponent()) { // Check to see if the interaction is a message component
                let [commandName, interactionName] = interaction.customId.split('.') // Separate the command name and the interaction name
                let command

                const error = () => interaction.reply({ content: 'Uh Oh! The devs made a mistake while creating this command.', ephemeral: true})

                if(interaction.isButton()) { // Check to see if its a button action
                    command = this.client.commands.get(commandName)['button'] // Get button handlers from the command (if there is one that is)
                    if(command[interactionName]) // If the particular button interaction exists
                        command[interactionName](interaction, this) // THen run it!
                    else 
                        await error() // Else error
                } else if(interaction.isContextMenu()) { // Check to see if its a context menu action
                    command = this.client.commands.get(commandName)['contextMenu'] // Get context handlers from the command (if there is one that is)
                    if(command[interactionName]) // If the particular context menu interaction exists 
                        command[interactionName](interaction, this) // Then run it!
                    else 
                        await error() // Else error
                } else if(interaction.isSelectMenu()) { // Check to see if its a select menu action
                    command = this.client.commands.get(commandName)['selectMenu'] // Get select menu handler form the command (if there is one that is)
                    if(command[interactionName]) // If the particular select menu interaction exists
                        command[interactionName](interaction, this) // Then run it!
                    else 
                        await error() // Else error 
                }
            }
        })

        this.login() // Logs the bot in!
    }

    /** Logs in the bot ONLY */
    async login() {
        if(!this.loggedIn) { // Check to see if the bot is already logged in
            await this.client.login(this.token) // Wait for the bot to log in 
            this.loggedIn = true // Set logged in to true
        }
    }

    /** Reloads or Uploads the commands in the bot that are in the commands folder */
    reloadCommands() {
<<<<<<< Updated upstream
        if(this.client.commands)
            delete this.client.commands
        console.log(this.client.commands)
        this.client.commands = new Collection();
        for (const file of fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js') || file.endsWith('.ts'))) {
            try {
                let _command
                if(file.includes('.js'))
                    _command = require(`../commands/${file}`)
                else if(file.includes('.ts')) {
                    // FIX UTIL IMPORTS
                    let fileTemp = ts.transpileModule(fs.readFileSync(path.join(__dirname, `../commands/${file}`)).toString('utf-8'), { compilerOptions: { module: ts.ModuleKind.CommonJS }}).outputText.replace('../lib/', './')
                    _command = requireFromString(fileTemp)
                } 
                console.log("" + Object.values(_command)[0]['execute'], fs.readFileSync(path.join(__dirname, `../commands/${file}`)))
                const name = Object.getOwnPropertyNames(_command)[1]
                let command: Machi = _command[name]
                if(!command.inDev && command.data && command.execute) {
                    if(command.data.name == undefined)
                        command.data.setName(name)
                    console.log(command.data.name, "has been added!")
                    this.client.commands.set(command.data.name, command)
                }
            } catch (error) {
                console.error(`UH OH, error loading ${file}\n Error: ${error}`)
=======
        if(this.client.commands) // Check to see if the command cache exists
            delete this.client.commands // If so, delete it
        this.client.commands = new Collection() // Create a new cache
        for (const file of fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js') || file.endsWith('.ts'))) { // Get each file from the commands folder
            try {
                console.log(file) // Log out the file name
                delete require.cache[require.resolve(`../commands/${file}`)] // Remove the command from the program cache 
                let _command = require(`../commands/${file}`) // Get the contents from the file 
                const name = Object.getOwnPropertyNames(_command)[1] // Get the name of the command
                let command: Machi = _command[name] // Get the actual command from the file
                if(!command.inDev && command.data && command.execute) { // Check to see if the command should be added (not in dev), if the command has data, and if the command has an execute function
                    if(command.data.name == undefined) // If the name is not set
                        command.data.setName(name) // Then set the name 
                    this.client.commands.set(command.data.name, command) // Add the command to the cache
                    console.log(command.data.name, "has been added!") // Log that it has been added
                }
            } catch (error) {
                console.error(`UH OH, error loading ${file}\n Error: ${error}`) // If there is an error somewhere, log it out 
>>>>>>> Stashed changes
            }
        }
    }

    // TODO: Add ability to have commands in subfolders 1 level deep only and error out on naming conflicts
    /** Takes all the files in commands folder, and uploades them to discord (except those with inDev == true)  */
    async updateCommands() {
        this.reloadCommands() // Reloads the commands 

        if([...this.client.commands.values()].length < 1) // Check to see if there are any commands in the cache 
            return // If none, return 

        console.log(`=======\nUpdating list of commands in five seconds`) // Create a countdown and wait for five seconds. This is because we don't want to spam discord's API so you have time to stop it.
        for await (let k of (new Array(5)).fill(0).map((v, i) => 5 - i))
            await [console.log(`In ${k}...`), sleep(1000)][1]

        await this.rest.put(Routes.applicationGuildCommands(this.client_id, this.guild_id), { body: this.client.commands.mapValues((v) => v.data.toJSON()) }) // Sends the command infromation to discord 
            .then(() => console.log("Successfully Updated!"))
            .catch(e => console.error("Looks like there was an error!", e))

        await this.login() // Log in. This is neccessary because we need to know specific information about the command to add in permissions to that command 

        let commandNameAndIdsObject: { [name: string]: ApplicationCommand } = {} // Create an object to hold the data
        ;(await this.client.guilds.cache.get(this.guild_id)?.commands.fetch()).toJSON().forEach(_ => commandNameAndIdsObject[_.name] = _) // For each command in the guild, get its data
        this.client.commands.filter(command => (command?.permissions ?? 0) != 0).toJSON().forEach(_ => commandNameAndIdsObject[_.data.name].permissions.set({permissions: _.permissions})) // For each command in the cache that has permissions, set the corresponding command in the guild its permissions
    }


    /** Utility function for a command to get itself from an instance of Machina */
    getCommandSelf(self: Machi) {
        return this.client?.commands.get(Object.getOwnPropertyNames(self)[1])
    }
}
export interface Machi {
    /** This is for adding in the command information */
    data: Partial<SlashCommandBuilder>,
    /** Any permissions you want to add to the bot */
    permissions?: ApplicationCommandPermissionData[]    
    // {
    //     type: "ROLE" | "USER",
    //     /** The id of the role or user itself */
    //     id: string, 
    //     /** Whether to permit them to use the command. True = allow, false = deny */
    //     permission: boolean
    // }[]
    /** The function that should be called when activated */
    execute(interaction: CommandInteraction, bot?: Machina): Promise<void>,
    /** Listen to a button interaction, with the key being name and value being the function to execute */
    button?: {
        [key: string]: (interaction: ButtonInteraction, bot?: Machina) => Promise<void>
    },
    /** Listen to a context menu interaction, with the key being name and value being the function to execute */
    contextMenu?: {
        [key: string]: (interaction: ContextMenuInteraction, bot?: Machina) => Promise<void>
    },
    /** Listen to a select menu component interaction, with the key being name and value being the function to execute */
    selectMenu?: {
        [key: string]: (interaction: SelectMenuInteraction, bot?: Machina) => Promise<void>
    },
    /** If the command data should be sent to discord */
    inDev: boolean,
    /** This is if you want to store data on a command during runtime. Useful for keeping data between execute() and an interaction */
    storage?: {
        [key: string]: any
    }
}

/**
 * TODO
 * [x] figure the guild fetch commands
 * [x] add it so permissions update
 * [ ] test out reload command
 * [ ] finish poll
 * [ ] start on new command
 */ 