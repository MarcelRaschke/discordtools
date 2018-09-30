const Discord = require('discord.js');
const Constants = require('../util/Constants');
const Util = require('../util/Util');
const APIManager = require('../api/APIManager');

class Client {
  /**
   * @param {string} token Client token.
   * @param {ClientOptions} [options] Client options.
   */
  constructor(token, options = {}) {
    /**
     * Client options.
     * @type {ClientOptions} Client options.
     */
    this.options = Util.combineDefault(Constants.DefaultOptions, options);

    this.token = token;
    if (typeof this.token !== 'string')
      throw new Error(Constants.Errors.INVALID_TOKEN);
    if (typeof this.options.apiRequestMethod !== 'string')
      throw new TypeError(Constants.Errors.INVALID_CLIENT_OPTION);
    if (typeof this.options.userAccount !== 'boolean')
      throw new TypeError(Constants.Errors.INVALID_CLIENT_OPTION);
    if (typeof this.options.restTimeOffset !== 'number')
      throw new TypeError(Constants.Errors.INVALID_CLIENT_OPTION);

    /**
     * API manager.
     * @type {APIManager}
     * @private
     */
    this.manager = new APIManager(this);

    /**
     * Timeouts set from {@link Client#setTimeout} that are still functional.
     * Extracted from Discord.js. (https://github.com/discordjs/discord.js)
     * @type {Set<Timeout>}
     * @private
     */
    this._timeouts = new Set();

    Object.defineProperty(this, 'token', {
      writable: true
    });
  }

  /**
   * Creates a guild.
   * @param {GuildData} data Guild data.
   * @example
   * // Creates a guild.
   * createGuild({
   *   name: 'Guild name',
   *   region: 'us-central',
   *   icon: 'https://link-to-an-icon.com',
   * })
   * .then((Guild) => {
   *   console.log(Guild);
   * })
   * .catch((err) => {
   *   console.log(err);
   * });
   */
  createGuild(data = {}) {
    if (typeof data !== 'object')
      throw new Error(Constants.Errors.MISSING_PARAM);
    return new Promise((resolve, reject) => {
      this.manager.methods
        .CreateGuild(data)
        .then(response => {
          return resolve(response);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  /**
   * Deletes a guild.
   * @param {string} guild_id Guild ID.
   * @example
   * // Deletes a guild.
   * deleteGuild('Guild ID');
   */
  deleteGuild(guild_id) {
    if (typeof guild_id !== 'string')
      throw new Error(Constants.Errors.MISSING_PARAM);
    return this.manager.methods.DeleteGuild(guild_id);
  }

  /**
   * Edits a guild.
   * @param {string} guild_id Guild ID.
   * @param {GuildEditData} data Guild update data.
   * @example
   * // Edits a guild.
   * editGuild('Guild ID', {
   *   name: 'Guild name',
   *   region: 'us-central',
   *   verificationLevel: 3,
   *   afkChannel: 'AFK channel ID',
   *   systemChannel: 'System channel ID',
   *   afkTimeout: 10000,
   *   icon: 'https://link-to-an-icon.com',
   *   owner: 'Owner ID',
   *   splash: 'https://link-to-splash.com',
   *   explicitContentFilter: 2,
   * });
   */
  editGuild(guild_id, data) {
    if (typeof guild_id !== 'string')
      throw new Error(Constants.Errors.MISSING_PARAM);
    const _data = {};
    if (data.name) _data.name = data.name;
    if (data.region) _data.region = data.region;
    if (typeof data.verificationLevel !== 'undefined')
      _data.verification_level = Number(data.verificationLevel);
    if (typeof data.afkChannel !== 'undefined')
      _data.afk_channel_id = data.afkChannel;
    if (typeof data.systemChannel !== 'undefined')
      _data.system_channel_id = data.systemChannel;
    if (data.afkTimeout) _data.afk_timeout = Number(data.afkTimeout);
    if (typeof data.icon !== 'undefined') _data.icon = data.icon;
    if (data.owner) _data.owner_id = data.owner;
    if (typeof data.splash !== 'undefined') _data.splash = data.splash;
    if (typeof data.explicitContentFilter !== 'undefined')
      _data.explicit_content_filter = Number(data.explicitContentFilter);
    this.manager.methods.EditGuild(guild_id, _data);
  }

  /**
   * Fetches a guild member.
   * @param {string} guild_id Guild ID.
   * @param {string} member_id Member ID.
   * @example
   * // Fetches a guild member.
   * fetchMember('Guild ID', 'Member ID')
   *   .then((GuildMember) => {
   *     console.log(GuildMember)
   *   })
   *   .catch((err) => {
   *     console.log(err)
   *   });
   */
  fetchMember(guild_id, member_id) {
    if (typeof guild_id !== 'string' || typeof member_id !== 'string')
      throw new Error(Constants.Errors.MISSING_PARAM);
    return new Promise((resolve, reject) => {
      this.manager.methods
        .fetchGuildMember(guild_id, member_id)
        .then(response => {
          return response;
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  /**
   * Edits a guild member.
   * @param {string} guild_id Guild ID.
   * @param {string} member_id Member ID.
   * @param {GuildMemberEditData} data Guild member update data.
   * @example
   * // Edits a guild member.
   * editMember('Guild ID', 'Member ID', {
        nick: 'Nickname',
        mute: true,
        deaf: false,
     });
   */
  editMember(guild_id, member_id, data) {
    if (typeof guild_id !== 'string' || typeof member_id !== 'string')
      throw new Error(Constants.Errors.MISSING_PARAM);
    return this.manager.methods.editGuildMember(guild_id, member_id, data);
  }

  /**
   * Kicks a guild member.
   * @param {string} guild_id Guild ID.
   * @param {string} member_id Guild member ID.
   * @param {string} [reason] Kick reason.
   * @example
   * // Kicks a guild member.
   * kick('Guild ID', 'Member ID');
   * @example
   * // Kick a guild member with a reason.
   * kick('Guild ID', 'Member ID', 'Kick reason.');
   */
  kick(guild_id, member_id, reason) {
    if (typeof guild_id !== 'string' || typeof member_id !== 'string')
      throw new Error(Constants.Errors.MISSING_PARAM);
    return this.manager.methods.kickGuildMember(guild_id, member_id, reason);
  }

  /**
   * Bans a guild member.
   * @param {string} guild_id Guild ID.
   * @param {string} member_id Guild member ID.
   * @param {Object|string|number} [data] Ban data.
   * @param {number} [data.days=0] Amount of days of messages to delete.
   * @param {string} [data.reason=null] Ban reason.
   * @example
   * // Bans a guild member.
   * ban('Guild ID', 'Member ID');
   * @example
   * // Bans a guild member with days and a reason.
   * ban('Guild ID', 'Member ID', {
   *   days: 7, // Delete the member's messages from amount of day(s).
   *   reason: 'Ban reason.'
   * });
   */
  ban(guild_id, member_id, data = {}) {
    if (typeof guild_id !== 'string' || typeof member_id !== 'string')
      throw new Error(Constants.Errors.MISSING_PARAM);
    if (typeof data === 'number') {
      data = {
        reason: null,
        'delete-message-days': data
      };
    } else if (typeof data === 'string') {
      data = {
        reason: data,
        'delete-message-days': 0
      };
    }
    if (data.days) data['delete-message-days'] = data.days;
    return this.manager.methods.banGuildMember(guild_id, member_id, data);
  }

  /**
   * Unbans a user.
   * @param {string} guild_id Guild ID.
   * @param {string} user_id User ID.
   * @param {string} [reason] Unban reason.
   * @example
   * // Unbans a user.
   * unban('Guild ID', 'User ID');
   * @example
   * // Unbans a user with a reason.
   * unban('Guild ID', 'User ID', 'Unban reason.');
   */
  unban(guild_id, user_id, reason) {
    if (typeof guild_id !== 'string' || typeof user_id !== 'string')
      throw new Error(ConstantSourceNode.Errors.MISSING_PARAM);
    return this.manager.methods.unbanUser(guild_id, user_id, reason);
  }

  /**
   * Deletes a message.
   * @param {string} channel_id Channel ID.
   * @param {string} message_id Message ID.
   * @example
   * // Deletes a message.
   * deleteMessage('Channel ID', 'Message ID');
   */
  deleteMessage(channel_id, message_id) {
    if (typeof channel_id !== 'string' || typeof message_id !== 'string')
      throw new Error(Constants.Errors.MISSING_PARAM);
    return this.manager.methods.deleteChannelMessage(channel_id, message_id);
  }

  /**
   * Pin a message.
   * @param {string} channel_id Channel ID.
   * @param {string} message_id Message ID.
   */
  pinMessage(channel_id, message_id) {
    if (typeof channel_id !== 'string' || typeof message_id !== 'string')
      throw new Error(Constants.Errors.MISSING_PARAM);
    return this.manager.methods.pinMessage(channel_id, message_id);
  }

  /**
   * Unpin a message.
   * @param {string} channel_id Channel ID.
   * @param {string} message_id Message ID.
   */
  unpinMessage(channel_id, message_id) {
    if (typeof channel_id !== 'string' || typeof message_id !== 'string')
      throw new Error(Constants.Errors.MISSING_PARAM);
    return this.manager.methods.unpinMessage(channel_id, message_id);
  }

  /**
   * Bulk deletes an amount of messages.
   * @param {string} channel_id Channel ID.
   * @param {array} message_ids Array of messages to delete.
   * @example
   * // Bulk deletes an amount of messages.
   * bulkDelete('Channel ID', ['Message ID', 'Message ID', 'Message ID', 'Message ID', 'Message ID']);
   */
  bulkDelete(channel_id, message_ids) {
    if (typeof channel_id !== 'string' || !Array.isArray(message_ids))
      throw new Error(Constants.Errors.MISSING_PARAM);
    if (message_ids < 2 || message_ids > 100)
      throw new RangeError('Messages limit: 2-100');
    return this.manager.methods.bulkDeleteMessages(channel_id, message_ids);
  }

  /**
   * Adds a guild role to a guild member.
   * @param {string} guild_id Guild ID.
   * @param {string} member_id Member ID.
   * @param {string} role_id Role ID.
   * @example
   * // Adds a guild role to a guild member.
   * addRole('Guild ID', 'Member ID', 'Role ID');
   */
  addRole(guild_id, member_id, role_id) {
    if (
      typeof guild_id !== 'string' ||
      typeof member_id !== 'string' ||
      typeof role_id !== 'string'
    )
      throw new Error(Constants.Errors.MISSING_PARAM);
    return this.manager.methods.addGuildMemberRole(
      guild_id,
      member_id,
      role_id
    );
  }

  /**
   * Removes a guild role from a guild member.
   * @param {string} guild_id Guild ID.
   * @param {string} member_id Member ID.
   * @param {string} role_id Role ID.
   * @example
   * // Removes a guild role from a guild member.
   * removeRole('Guild ID', 'Member ID', 'Role ID');
   */
  removeRole(guild_id, member_id, role_id) {
    if (
      typeof guild_id !== 'string' ||
      typeof member_id !== 'string' ||
      typeof role_id !== 'string'
    )
      throw new Error(Constants.Errors.MISSING_PARAM);
    this.manager.methods.removeGuildMemberRole(guild_id, member_id, role_id);
  }

  /**
   * @param {string} guild_id Guild ID.
   * @param {RoleData} [data] Role data.
   * @example
   * // Creates a guild role.
   * createRole('Guild ID', {
   *   name: 'Role name',
   * });
   * @example
   * // Creates a guild role with role color.
   * createRole('Guild ID', {
   *   name: 'Role name',
   *   color: '#FF0000',
   * });
   */
  createRole(guild_id, data = {}) {
    if (typeof guild_id !== 'string')
      throw new Error(Constants.Errors.MISSING_PARAM);
    return this.manager.methods.createGuildRole(guild_id, data);
  }

  /**
   * Deletes a guild role.
   * @param {string} guild_id Guild ID.
   * @param {string} role_id Role ID.
   * @example
   * // Deletes a guild role.
   * deleteRole('Guild ID', 'Role ID');
   */
  deleteRole(guild_id, role_id) {
    if (typeof guild_id !== 'string' || typeof role_id !== 'string')
      throw new Error(Constants.Errors.MISSING_PARAM);
    return this.manager.methods.deleteGuildRole(guild_id, role_id);
  }

  /**
   * Edits a guild role.
   * @param {string} guild_id Guild ID.
   * @param {string} role_id Role ID.
   * @param {RoleUpdateData} data Role update data.
   * @example
   * // Edits a guild role.
   * editRole('Guild ID', 'Role ID', {
   *   name: 'Role name',
   *   position: 5,
   * });
   */
  editRole(guild_id, role_id, data) {
    if (typeof guild_id !== 'string' || typeof role_id !== 'string')
      throw new Error(Constants.Errors.MISSING_PARAM);
    return this.manager.methods.editGuildRole(guild_id, role_id, data);
  }

  /**
   * @param {EmbedData} [data] Embed data.
   * @example
   * const embed = tools.embed({
   *   title: 'Embed title',
   *   description: 'Embed description',
   *   color: '#3CB371',
   *   author: 'Embed author',
   *   image: 'https://link-to-an-image.com',
   *   url: 'https://the-embed-url.com',
   *   timestamp: '2018-06-01T11:36:07.830Z',
   *   footer: 'Embed footer',
   *   thumbnail: 'https://link-to-an-image.com',
   * });
   *
   * // Sending the embed using Discord.js
   * channel.send({ embed: embed });
   *
   * // Sending the embed using Eris
   * client.createMessage('Channel ID', { embed: embed });
   */
  embed(data = {}) {
    var RichEmbed = new Discord.RichEmbed();
    if (data.title) RichEmbed.setTitle(data.title);
    if (data.description) RichEmbed.setDescription(data.description);
    if (data.color) RichEmbed.setColor(data.color);
    if (data.author) RichEmbed.setAuthor(data.author);
    if (data.image) RichEmbed.setImage(data.image);
    if (data.url) RichEmbed.setURL(data.url);
    if (data.timestamp) RichEmbed.setTimestamp(data.timestamp);
    if (data.footer) RichEmbed.setFooter(data.footer);
    if (data.thumbnail) RichEmbed.setThumbnail(data.thumbnail);
    return RichEmbed;
  }

  /**
   * Creates a guild channel.
   * @param {string} guild_id Guild ID.
   * @param {string} channel_name Channel name.
   * @param {string|number} [channel_type='text'] Channel type. ['text', 'voice', 'category', 'dm', 'group_dm']
   * @param {string} [channel_topic=undefined] Channel topic.
   * @param {boolean} [nsfw=false] NSFW boolean. If true: the channel will be marked as a NSFW channel. If not: reciprocal.
   * @example
   * // Creates a guild channel.
   * createChannel('Guild ID', 'channel-name', 'voice', 'Channel Topic', false);
   */
  createChannel(guild_id, channel_name, channel_type, channel_topic, nsfw) {
    if (typeof guild_id !== 'string' || typeof channel_name !== 'string')
      throw new Error(Constants.Errors.MISSING_PARAM);
    this.manager.methods.createGuildChannel(
      guild_id,
      channel_name,
      channel_type,
      channel_topic,
      nsfw
    );
  }

  /**
   * Deletes a guild channel.
   * @param {string} channel_id Channel ID.
   * @example
   * // Deletes a guild channel.
   * deleteChannel('Channel ID');
   */
  deleteChannel(channel_id) {
    if (typeof channel_id !== 'string')
      throw new Error(Constants.Errors.MISSING_PARAM);
    this.manager.methods.deleteGuildChannel(channel_id);
  }

  /**
   * Edits a guild channel.
   * @param {string} channel_id Channel ID.
   * @param {ChannelEditData} data Channel update data.
   * @example
   * // Edits a guild channel.
   * editChannel('Channel ID', {
   *   name: 'new-channel-name',
   *   topic: 'Channel topic',
   *   position: 5,
   * });
   */
  editChannel(channel_id, data) {
    if (typeof channel_id !== 'string')
      throw new Error(Constants.Errors.MISSING_PARAM);
    return this.manager.methods.editGuildChannel(channel_id, data);
  }

  /**
   * Creates a guild emoji.
   * @param {string} guild_id Guild ID.
   * @param {BufferResolvable|Base64Resolvable} image Emoji image.
   * @param {string} name Emoji name.
   * @example
   * // Creates a guild emoji using an image from a URL.
   * createEmoji('Guild ID', 'https://link-to-an-image.com', 'Emoji name');
   * @example
   * // Creates a guild emoji using an image from your storage.
   * createEmoji('Guild ID', './path/to/emoji.png', 'Emoji name');
   */
  createEmoji(guild_id, image, name) {
    if (typeof guild_id !== 'string' || typeof name !== 'string')
      throw new Error(Constants.Errors.MISSING_PARAM);
    if (typeof image === 'string' && image.startsWith('data:')) {
      return this.manager.methods.createGuildEmoji(guild_id, image, name);
    } else {
      return Util.resolveImage(image).then(data => {
        this.manager.methods.createGuildEmoji(guild_id, data, name);
      });
    }
  }

  /**
   * Deletes a guild emoji.
   * @param {string} guild_id Guild ID
   * @param {string} emoji_id Emoji ID.
   * @example
   * // Deletes a guild emoji.
   * deleteEmoji('Guild ID', 'Emoji ID');
   */
  deleteEmoji(guild_id, emoji_id) {
    if (typeof guild_id !== 'string' || typeof emoji_id !== 'string')
      throw new Error(Constants.Errors.MISSING_PARAM);
    return this.manager.methods.deleteGuildEmoji(guild_id, emoji_id);
  }

  /**
   * Edits a guild emoji.
   * @param {string} guild_id Guild ID.
   * @param {string} emoji_id Emoji ID.
   * @param {GuildEmojiEditData} data Emoji update data.
   * @example
   * // Edits a guild emoji.
   * editEmoji('Guild ID', 'Emoji ID', {});
   */
  editEmoji(guild_id, emoji_id, data) {
    if (typeof guild_id !== 'string' || typeof emoji_id !== 'string')
      throw new Error(Constants.Errors.MISSING_PARAM);
    return this.manager.methods.editGuildEmoji(guild_id, emoji_id, data);
  }

  /**
   * Sets a timeout that will be automatically cancelled if the client is destroyed.
   * Extracted from Discord.js (https://github.com/discordjs/discord.js)
   * @param {Function} fn Function to execute.
   * @param {number} delay Execution time. (in milliseconds)
   * @param {...*} args Function arguments.
   * @returns {Timeout}
   */
  setTimeout(fn, delay, ...args) {
    const timeout = setTimeout(() => {
      fn(...args);
      this._timeouts.delete(timeout);
    }, delay);
    this._timeouts.add(timeout);
    return timeout;
  }
}

module.exports = Client;
