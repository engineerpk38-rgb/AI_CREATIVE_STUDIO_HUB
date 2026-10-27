# 时间轴（edge · en-US-ChristopherNeural +0%，共 890 帧 = 29.7s，47 词，语速 2.24 词/s）

| 句 | 章 | 帧 from–to | 时长 | 末块 | 段末 | 文本（| 为字幕切分） |
|---|---|---|---|---|---|---|
| S01 | 1 | 86–236 | 5.0s | 67 |  | Welcome to the autonomous AI video studio,｜where code and narration come together. |
| S02 | 1 | 247–383 | 4.6s | 65 | ¶ | Every graphic is rendered programmatically,｜synchronized with crystal-clear audio. |
| S03 | 2 | 439–618 | 6.0s | 79 |  | Text-to-speech voiceovers generate precise timestamps,｜aligning subtitles down to the exact frame. |
| S04 | 2 | 629–790 | 5.4s | 82 | ¶ | From concept to finished MP4 video,｜the entire workflow runs completely in code. |

## 章节起始帧
- 第1章 Pipeline Overview：f86
- 第2章 Audio and Motion Sync：f439

段末 ¶ = narration.txt 里空行/章界前的那句（一个镜头讲完，画面在这里停 1–1.5 s 再切；段内句只隔 10 帧，不停顿）。
末块 = 末尾字幕块的帧数（段末句 ⚠ <45：末拍元素 22 帧入场 + 8 帧离场后停不满 30 帧）。补法：该句后加 `## gap 15–30` 重跑（缓存命中），或分镜时把末拍元素前挂到上一块。
