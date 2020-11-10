require('module-alias/register')

const Discord = require('discord.js')
const client = new Discord.Client()

const { MongoClient } = require('mongodb')
const MongoDBProvider = require('commando-provider-mongo')
const path = require('path')
const Commando = require('discord.js-commando')

const config = require('./config.json')
const { loadLanguages } = require('./lang')
const loadCommands = require('./commands/load-commands')
const commandBase = require('./commands/command-base')
const loadFeatures = require('./features/load-features')
const mongo = require('./mongo')

const modLogs = require('./features/features/mod-logs')

const Client = new Commando.CommandoClient({
  owner: '335307399541948418',
  commandPrefix: config.prefix,
})

client.setProvider(
  MongoClient.connect(config.mongoPath, {
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
    .then((client) => {
      return new MongoDBProvider(client, 'WornOffKeys')
    })
    .catch((err) => {
      console.error(err)
    })
)

client.on('ready', async () => {
  console.log('The client is ready!')

  await mongo()

  client.registry
    .registerGroups([
      ['misc', 'misc commands'],
      ['moderation', 'moderation commands'],
      ['economy', 'Commands for the economy system'],
      ['giveaway', 'Commands to manage giveaways'],
      ['games', 'Commands to handle games'],
      ['thanks', 'Commands to help thank people'],
      ['suggestions', 'Commands regarding suggestions'],
      ['testing', 'Commands to test joining and leaving'],
    ])
    .registerDefaults()
    .registerCommandsIn(path.join(__dirname, 'cmds'))

  loadLanguages(client)
  // commandBase.loadPrefixes(client)
  // loadCommands(client)
  loadFeatures(client)

  modLogs(client)
})

client.login(config.token)
