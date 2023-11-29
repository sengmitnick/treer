// js/data.js

// 音乐数据模块，负责加载音乐文件和解析音乐元数据

// 音乐数据列表
var musicList = [
    {
        title: "Night Owl",
        artist: "Broke For Free",
        cover: "assets/pexels-photo-3100835.jpeg",
        src: "assets/Broke_For_Free_-_01_-_Night_Owl.mp3"
    },
    {
        title: "Shipping Lanes",
        artist: "Chad Crouch",
        cover: "assets/pexels-photo-1717969.jpeg",
        src: "assets/Chad_Crouch_-_Shipping_Lanes.mp3"
    },
    {
        title: "Enthusiast",
        artist: "Tours",
        cover: "assets/pexels-photo-2264753.jpeg",
        src: "assets/Tours_-_01_-_Enthusiast.mp3"
    }
];

// 获取音乐列表的函数
function getMusicList() {
    return musicList;
}

// 导出音乐数据模块的接口
export { getMusicList };
