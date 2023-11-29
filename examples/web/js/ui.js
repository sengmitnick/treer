// js/ui.js

// 用户界面模块，负责实现播放/暂停按钮、进度条、音量控制等的交互功能

// 导入控制模块
import { playMusic, pauseMusic, forwardMusic, rewindMusic, setVolume } from './control.js';

// 获取HTML元素
var playButton = document.getElementById('play-button');
var pauseButton = document.getElementById('pause-button');
var forwardButton = document.getElementById('forward-button');
var rewindButton = document.getElementById('rewind-button');
var volumeSlider = document.getElementById('volume-slider');

// 播放按钮点击事件
playButton.addEventListener('click', function() {
    // 获取当前选中的音乐
    var currentMusic = document.getElementById('music-select').value;
    // 调用控制模块的播放音乐函数
    playMusic(currentMusic);
});

// 暂停按钮点击事件
pauseButton.addEventListener('click', function() {
    // 调用控制模块的暂停音乐函数
    pauseMusic();
});

// 快进按钮点击事件
forwardButton.addEventListener('click', function() {
    // 调用控制模块的快进音乐函数
    forwardMusic();
});

// 快退按钮点击事件
rewindButton.addEventListener('click', function() {
    // 调用控制模块的快退音乐函数
    rewindMusic();
});

// 音量滑块滑动事件
volumeSlider.addEventListener('change', function() {
    // 获取滑块当前的值
    var volume = volumeSlider.value;
    // 调用控制模块的设置音量函数
    setVolume(volume);
});
