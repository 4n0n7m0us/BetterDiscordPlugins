//META{"name":"NoDeleteMessages","website":"https://github.com/Mega-Mewthree/BetterDiscordPlugins/Plugins/NoDeleteMessages","source":"https://github.com/Mega-Mewthree/BetterDiscordPlugins/Plugins/NoDeleteMessages/NoDeleteMessages.plugin.js"}*//

/*
-----BEGIN PGP SIGNED MESSAGE-----
Hash: SHA512

*/

/*
MIT License

Copyright (c) 2018 Mega-Mewthree

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// Updated March 10th, 2019.

class NoDeleteMessages {
  getName() {
    return "NoDeleteMessages";
  }
  getShortName() {
    return "NoDeleteMessages";
  }
  getDescription() {
    return 'Prevents the client from removing deleted messages (until restart).\nUse ".NoDeleteMessages-deleted-message .da-markup" to edit the CSS of deleted messages.\n\nMy Discord server: https://join-nebula.surge.sh\nDM me @Lucario ☉ ∝ x²#7902 or create an issue at https://github.com/Mega-Mewthree/BetterDiscordPlugins for support.';
  }
  getVersion() {
    return "0.0.8";
  }
  getAuthor() {
    return "Mega_Mewthree"; //Current Discord account: @Lucario ☉ ∝ x²#7902 (438469378418409483)
  }
  constructor() {
    this.deletedMessages = {};
  }
  load() {}
  unload() {}
  start() {
    let libraryScript = document.getElementById("zeresLibraryScript");
    if (!window.ZeresLibrary || window.ZeresLibrary.isOutdated) {
      if (libraryScript) libraryScript.parentElement.removeChild(libraryScript);
      libraryScript = document.createElement("script");
      libraryScript.setAttribute("type", "text/javascript");
      libraryScript.setAttribute("src", "https://rauenzi.github.io/BetterDiscordAddons/Plugins/PluginLibrary.js");
      libraryScript.setAttribute("id", "zeresLibraryScript");
      document.head.appendChild(libraryScript);
    }
    if (window.ZeresLibrary) this.initialize();
    else libraryScript.addEventListener("load", () => { this.initialize(); });
  }
  initialize() {
    window.updateDeletedMessages = () => this.updateDeletedMessages;
    PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), `https://raw.githubusercontent.com/Mega-Mewthree/BetterDiscordPlugins/master/Plugins/${this.getName()}/${this.getName()}.plugin.js`);
    BdApi.injectCSS("NoDeleteMessages-CSS", `
        .NoDeleteMessages-deleted-message .da-markup{
            color: #F00 !important;
        }
        .NoDeleteMessages-deleted-message:not(:hover) img, .NoDeleteMessages-deleted-message:not(:hover) .mention, .NoDeleteMessages-deleted-message:not(:hover) .reactions, .NoDeleteMessages-deleted-message:not(:hover) a {
            filter: grayscale(100%) !important;
        }
        .NoDeleteMessages-deleted-message img, .NoDeleteMessages-deleted-message .mention, .NoDeleteMessages-deleted-message .reactions, .NoDeleteMessages-deleted-message a {
            transition: filter 0.3s !important;
        }
    `);
    Patcher.instead(this.getName(), InternalUtilities.WebpackModules.find(m => m.dispatch), "dispatch", (thisObject, args, originalFunction) => {
      let shouldFilter = this.filter(args[0]);
      if (!shouldFilter) return originalFunction(...args);
    });
    BdApi.showToast("NoDeleteMessages has started!");
  }
  stop() {
    this.deletedMessages = {};
    BdApi.clearCSS("NoDeleteMessages-CSS");
    Patcher.unpatchAll(this.getName());
  }
  filter(evt) {
    if (evt.type === "MESSAGE_DELETE") {
      if (Array.isArray(this.deletedMessages[evt.channelId])){
        if (this.deletedMessages[evt.channelId].length > 149) this.deletedMessages[evt.channelId].shift(); // 150 because only 150 messages are stored per channel.
        this.deletedMessages[evt.channelId].push(evt.id);
      } else {
        this.deletedMessages[evt.channelId] = [evt.id];
      }
      if (evt.channelId === this.getCurrentChannelID()) this.updateDeletedMessages();
      return true;
    } else if (evt.type === "MESSAGE_DELETE_BULK") {
      if (Array.isArray(this.deletedMessages[evt.channelId])){
        if (this.deletedMessages[evt.channelId].length + evt.ids.length > 149) this.deletedMessages[evt.channelId].splice(0, this.deletedMessages[evt.channelId].length + evt.ids.length - 150);
        this.deletedMessages[evt.channelId].push(...evt.ids);
      } else {
        this.deletedMessages[evt.channelId] = [...evt.ids];
      }
      if (evt.channelId === this.getCurrentChannelID()) this.updateDeletedMessages();
      return true;
    }
    return false;
  }
  observer({addedNodes}) {
    let len = addedNodes.length;
    let change;
    while (len--){
      change = addedNodes[len];
      if (change.classList && change.classList.contains("da-messagesWrapper")) {
        this.updateDeletedMessages();
        break;
      }
    }
  }
  updateDeletedMessages() {
    const channelDeletedMessages = this.deletedMessages[this.getCurrentChannelID()];
    if (!channelDeletedMessages) return;
    let maybeAMessageID;
    $(".da-message").each((index, elem) => {
      try {
        maybeAMessageID = elem[Object.keys(elem).find(k => k.startsWith("__reactInternalInstance"))].return;
        if (channelDeletedMessages.includes(maybeAMessageID.return.return.key) || channelDeletedMessages.includes(maybeAMessageID.return.return.key) || channelDeletedMessages.includes(maybeAMessageID.return.key) || channelDeletedMessages.includes(maybeAMessageID.key)) {
          elem.classList.add("NoDeleteMessages-deleted-message");
        }
      } catch (e) {}
    });
  }
  getCurrentChannelID() {
    return DiscordModules.SelectedChannelStore.getChannelId();
  }
}

/*
-----BEGIN PGP SIGNATURE-----

iQEzBAEBCgAdFiEEGTGecftnrhRz9oomf4qgY6FcSQsFAlyEzLgACgkQf4qgY6Fc
SQvk2QgAr4Hb1r1b2EfGQnibaz/WxE25qMDIhS/TCjnmmX1MgbJ57JcGFwH5Aq6K
63HrFdlbAcT0KoU3Q68fN2uC0Iasg9kjxYmKN5hrH7OcgP1Y5fF+EZgp/xgrf+2+
T0TgK37EEG8RNINWtcRuS1EuVnHa4BxPxOsxzvB/dIAFbSsYAFFdlzwPe6JDEVRq
PV5lw5iDAeDHdrlY0pDMs+NfnfQnDeVcMqDS4x7afAg1HKrSG6DnbUlEEkD4sE3c
7RNfaBixTW3nHb+xgoRan9EB3XvjXxRPvubMRy9sSofBY1sKwA8VDYPvPJXvE0Ey
HAaYlgPXyYUYlYDsztQ1kReeFP5agQ==
=fAIr
-----END PGP SIGNATURE-----
*/
