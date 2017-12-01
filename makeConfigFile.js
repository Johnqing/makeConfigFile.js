const net = require('net');
const fs = require('fs');
/**
 * 创建server来检查
 * @param config
 * @returns {Promise}
 */
function createServer(config = {}){
	const server = config.server;
	return new Promise((resolve, reject) => {
		function onListen(){
			server.removeListener('error', onError);
			server.close();
			resolve({
				port: config.port,
				host: config.host
			});
		}

		function onError(err){
			server.removeListener('listening', onListen);
			if (err.code !== 'EADDRINUSE' && err.code !== 'EACCES') {
				return resolve(err);
			}
			reject(err);
		}

		server.once('error', onError);
		server.once('listening', onListen);
		server.listen(config.port, config.host);
	});
}

/**
 * 端口测试
 * @param config
 * @param callback
 */
function testPort(config = {}, callback=()=>{}){
	config.server = config.server || net.createServer(function(){});
	config.port = config.port || 5022;
	config.host = config.host || '127.0.0.1';

	createServer(config)
		.then((config)=>{
			callback(config);
		})
		.catch(()=>{
			config.port = parseInt(config.port) + 1;
			if(config.port > 9000){
				return callback(null, '超过最大检查数')
			}
			testPort(config);
		});
}
/**
 * 包装为promise的接口
 * @param config
 * @returns {Promise}
 */
const testPortPromise = exports.testPort = (config = {}) => {
	return new Promise((resolve, reject) => {
		testPort(config, function(data, err){
			if(err){
				console.log('[testPort|error]', err);
				return reject(err);
			}
			console.log('[testPort|success]', data);
			resolve(data);
		})
	})
};


const mkConfigFile = exports.mkConfigFile = function (config = {}){
	return testPortPromise({
		host: config.host,
		port: config.port
	}).then((res)=>{
		const template = `
			module.exports = {
			    port: ${res.port},
			    logPath: './logs',
			    secretKey: 'secret',
			    api: {},
			    cookie: {
			        maxAge: 86400000
			    },
			    db: {}
			}
		`;

		fs.writeFileSync(config.env_dir, template);
		return res;
	})
	.then((res)=>{
			const template = `
				server {
					listen	   80;
					server_name  ${config.nginx_server_name}

					rewrite ^/$ /index;

					#allow 10.0.0.0/8;  #允许的IP
					#deny all;

					location = /ENV {
						allow 127.0.0.1;
						deny all;
					}

					location ~ .*\.map$ {
						deny all;
					}
				    location /error.gif {
				        expires 30d;
				    }
					location / {
						proxy_pass http://${res.host}:${res.port};
						proxy_http_version 1.1;
						proxy_set_header Upgrade $http_upgrade;
						proxy_set_header Connection 'upgrade';
						proxy_cache_bypass $http_upgrade;

						proxy_set_header Host $host;
						proxy_redirect off;
						proxy_set_header X-Real-IP $remote_addr;
						proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
						proxy_connect_timeout 60;
						proxy_read_timeout 600;
						proxy_send_timeout 600;
					}

				}

			`;
			return fs.writeFileSync(config.nginx_dir, template);
		})
		.catch((err) => {
			console.log(err);
		})

};
