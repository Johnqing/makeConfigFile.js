# 检查未被占用的端口号生成配置文件

## 使用说明

### 端口号检查是否被占用

`testPortPromise` 支持传入一个配置 ( `options = {}` )

#### 配置项
+ `host` 可选项，需要检查的ip。默认为 `127.0.0.1`
+ `port` 可选项，需要开始检查的端口。默认为 `5200`

```
testPortPromise({
  host: '127.0.0.1',
	port: 5022
});
```


### 生成项目中的配置文件

#### 配置项
+ `host` 可选项，需要检查的ip。默认为 `127.0.0.1`
+ `port` 可选项，需要开始检查的端口。默认为 `5200`
+ `env_dir` 必选项，生成的环境配置文件路径
+ `nginx_dir` 必选项，生成的nginx配置文件路径
+ `nginx_server_name` 必选项，生成的nginx的域名


```
mkConfigFile({
	host: '127.0.0.1',
	port: 5022,
	env_dir: 'test1.js',
	nginx_dir: 'test1.conf',
	nginx_server_name: 'xxx'
});

```
