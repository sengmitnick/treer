// js/main.js

// 主JS文件，负责初始化播放器，并管理各个模块的交互

// 导入用户界面模块
import './ui.js';

// 导入音乐数据模块
import { getMusicList } from './data.js';

// 获取HTML元素
var musicSelect = document.getElementById('music-select');

// 初始化音乐选择列表
function initMusicSelect() {
    // 获取音乐列表
    var musicList = getMusicList();
    // 遍历音乐列表
    for (var i = 0; i < musicList.length; i++) {
        // 创建一个option元素
        var option = document.createElement('option');
        // 设置option的值为音乐的路径
        option.value = musicList[i].src;
        // 设置option的文本为音乐的标题
        option.text = musicList[i].title;
        // 将option添加到音乐选择列表中
        musicSelect.add(option);
    }
}

// 初始化音乐播放器
function initMusicPlayer() {
    // 初始化音乐选择列表
    initMusicSelect();
}

// 当文档加载完成后，初始化音乐播放器
document.addEventListener('DOMContentLoaded', initMusicPlayer);
