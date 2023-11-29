// js/control.js

// 控制模块，负责管理音乐的播放、暂停、快进、快退等控制功能

// 创建一个音频对象
var audio = new Audio();

// 播放音乐的函数
function playMusic(src) {
    audio.src = src;  // 设置音乐文件路径
    audio.play();     // 播放音乐
}

// 暂停音乐的函数
function pauseMusic() {
    audio.pause();    // 暂停音乐
}

// 快进音乐的函数
function forwardMusic() {
    audio.currentTime += 10;  // 快进10秒
}

// 快退音乐的函数
function rewindMusic() {
    audio.currentTime -= 10;  // 快退10秒
}

// 设置音量的函数
function setVolume(volume) {
    audio.volume = volume;    // 设置音量
}

// 导出控制模块的接口
export { playMusic, pauseMusic, forwardMusic, rewindMusic, setVolume };
