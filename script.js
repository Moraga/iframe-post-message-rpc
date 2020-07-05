
//
// Script front
//

// script não está migrado para avaliação de uso em outras páginas e
// parceiros que não possuam a estrutura do projeto
(function () {
    // a comunicação com script back é feita via iframe
    var ifr = document.createElement('iframe');
    ifr.style.display = 'none';
    ifr.src = 'https://some/cors/enabled/server.html';
    document.body.appendChild(ifr);
    
    /**
     * Objeto com métodos disponíveis para execução no script back
     * RPC - Remote procedure calls
     */
    var rpc = {
        /**
         * Recebe notificação que o script back está pronto
         */
        backendReady: function () {
            // captura e envia as preferências do usuário
            rpc.defaultPrefs();
            // envia as informações da página/componente atual de navegação
            send('history', [currentPageId()]);
        },

        /**
         * Captura preferências do usuário e envia para o script back
         */
        defaultPrefs: function () {
            var find = [
                // google id
                ['gid', /_gid=([^;]+)/],
                // localização no formato: cidade_estado_país
                ['loc', /"ttp":{[^{]*?_(.*?)_\d+/]
            ];

            var prefs = {};
            var found = false;
            var source = '';

            // cookie
            try {
                source += document.cookie.toString().split(';').map(function (item) {
                    // aplicar decodificadores
                    try {
                        item = decodeURIComponent(item);
                    } catch (_) {}
                    return item;
                }).join(';');
            } catch (_) {}

            // session storage
            try {
                source += JSON.stringify(sessionStorage).replace(/\\/g, '');
            } catch (_) {}
            
            // captura informações da fonte de dados gerada
            find.forEach(function (item) {
                var matched = item[1].exec(source);
                if (matched) {
                    prefs[item[0]] = matched[1];
                    found = true;
                }
            });

            // envia as preferências encontradas
            if (found) {
                send('prefs', [prefs]);
            }
        },

        /**
         * Exemplo de recebimento de sugestões do script back
         * @param {array} data 
         */
        suggestions: function (data) {
            console.log('received suggestions', data);
        }
    };

    /**
     * Obtém identificador da página atual
     * @return {string}
     */
    function currentPageId() {
        if ('Audience' in window && 'mediaId' in window.Audience) {
            return window.Audience.mediaId;
        }
        var canonical = document.querySelector('link[rel=canonical]');
        return canonical ? canonical.href : window.location.hostname;
    }

    /**
     * Envia mensagem para script front
     * @param {string} method Nome do método a ser executado
     * @param {any?} params Parâmetros de execução do método no back
     * @param {Function?} callback
     */
    function send(method, params, callback) {
        var id;
        if (callback) {
            rpc[id = uuid()] = callback;
        }
        return ifr.contentWindow.postMessage({jsonrpc: '2.0', method: method, params: params, id: id}, '*');
    }

    // recebe mensagens do script back via postMessage
    window.addEventListener('message', function (event) {
        var req = event.data;
        if (rpc.hasOwnProperty(req.method)) {
            var res = rpc[req.method].apply(null, req.params);
            if (req.id) {
                send(req.id, [res]);
            }
        }
    });

    // notifica o script back que o usuário está deixando a página
    window.addEventListener('beforeunload', function (event) {
        send('quit');
    });

    function uuid() {
        var ret = '';
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (var i = 12; i--; ret += chars[rand(0, chars.length - 1)]);
        return ret;
    }

    function rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    // debugger
    window.ifrrpc = send;
})();