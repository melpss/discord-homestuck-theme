/**
 * @name homestuckPlugin
 * @version 0.0.0
 * @website melps.neocities.org
 */

 class homestuckPlugin {
    constructor() {
        this.messageObserver = undefined;
        this.containerObserver = undefined;
        this.patchInterval = undefined;
        this.isDM = false;
        this.currentChannel = undefined;
    }
    getUserColor(id) {
        let colors = ["#0715cd", "#00d5f2", "#b536da", "#ff6ff2", "#e00707", "#f2a400", "#4ac925", "#1f9400", "#626262",
    "#a10000", "#a15000", "#a1a100", "#416600", "#008141", "#008282", "#005682", "#000056", "#4200b0", "#6a006a", "#77003c",
    "#2ed73a"];
        let sid = parseInt(id.slice(7, 10));
        return colors[sid % colors.length];
    }

    async start() {
        let container = document.getElementsByClassName('content-1jQy2l')[0];
        if(!container) return setTimeout(() => this.start(), 1000);
        
        this.currentChannel = BdApi.findModuleByProps("getLastSelectedChannelId", "getChannelId").getChannelId();
        this.containerObserver = new MutationObserver(() => {
            if(this.messageObserver) this.messageObserver.disconnect();
            let scroller = document.getElementsByClassName('scrollerInner-2PPAp2')[0];
            this.isDM = scroller.ariaLabel === "Messages in ";
            this.currentChannel = BdApi.findModuleByProps("getLastSelectedChannelId", "getChannelId").getChannelId();
            this.setMessageObserver();
            this.patchAllMessages();
        });
        this.containerObserver.observe(container, { childList: true });
        this.patchInterval = setInterval(() => {
            let container = document.getElementsByClassName('scrollerInner-2PPAp2')[0];
            let firstMessage = Array.from(container.children).reverse().find(m => m.id.includes('chat-messages'));
            this.isDM = container.ariaLabel === "Messages in ";
            this.currentChannel = BdApi.findModuleByProps("getLastSelectedChannelId", "getChannelId").getChannelId();
            if(firstMessage) {
                if(!firstMessage.getElementsByClassName('hotel-msg-userid')[0]) {
                    this.patchAllMessages();
                    this.setMessageObserver();
                }
            }
        }, 1000);
    }
    async stop() {
        if (this.messageObserver) this.messageObserver.disconnect();
        if (this.containerObserver) this.containerObserver.disconnect();
        if (this.patchInterval) clearInterval(this.patchInterval);
    }
    pad (num) {
        return num < 10 ? '0' + num : num;
    }
    async patchAllMessages() {
        let messages = document.getElementsByClassName('scrollerInner-2PPAp2')[0];
        if(!messages.children[0].getElementsByClassName('hotel-msg-userid')[0]) {
            for (const msg of messages.children) {
                this.patchMessage(msg);
            }
        }
    }
    async setMessageObserver() {
        let messages = document.getElementsByClassName('scrollerInner-2PPAp2')[0];
        this.messageObserver = new MutationObserver(mutationList => {
            for (const mutation of mutationList) {
                if (mutation.type === 'childList') {
                    for (const msg of mutation.addedNodes) {
                        this.patchMessage(msg);
                    }
                }
            }
        });
        this.messageObserver.observe(messages, { childList: true });
    }
    
    getMessageData(msg_id) {
        return BdApi.findModuleByProps("getMessages").getMessage(this.currentChannel, msg_id);
    }
    
    async patchMessage(msg) {
        
        if(msg.getElementsByClassName('homestuck-patched')[0]) return;
        if(!msg) return;
        let time = msg.getElementsByTagName('time')[0];
        if(!time) return;
        let message = msg.getElementsByClassName('message-2CShn3')[0];

        if(time) {
            let date = new Date(time.getAttribute('datetime'));
            let currentDate = new Date();
            let notToday = currentDate.getTime() - date.getTime() > 8.64e+7 || currentDate.getDay() !== date.getDay();
            if(notToday) time.parentElement.classList.add('hotel-not-today');
            time.innerText = `${notToday ? `${this.pad(date.getMonth()+1)}${this.pad(date.getDate())} ` : ''}${this.pad(date.getHours())}${this.pad(date.getMinutes())}`;
        }
       if(time){
        time.remove()
       }

        let username = msg.querySelector('.headerText-2z4IhQ > .username-h_Y3Us');
        username.innerText += ":";

        if(username) {
            username.style.color = this.getUserColor(message.dataset.authorId)
        };
        username.classList.add("homestuck-patched");
        
        let textmsg = msg.querySelector(".messageContent-2t3eCI");
        if(textmsg) {
            textmsg.style.color = this.getUserColor(message.dataset.authorId)
        }
        let callun = msg.querySelector(".username-u-ebrn");
        if(callun) {
            callun.style.color = this.getUserColor(message.dataset.authorId)
        }
        

        
    }
}

module.exports = homestuckPlugin;
