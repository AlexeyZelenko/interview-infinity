import { ref } from 'vue';

const VIDEO_MIME_TYPE = 'video/webm;codecs=vp8,opus';

export class VideoProcessor {
    private static async createOffscreenCanvas(width: number, height: number): Promise<OffscreenCanvas> {
        return new OffscreenCanvas(width, height);
    }

    static async compressVideo(blob: Blob, options = {
        maxWidth: 1280,
        maxHeight: 720,
        videoBitrate: 1000000, // 1 Mbps
        targetSize: 10 * 1024 * 1024 // 10MB target size
    }): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(blob);

            video.onloadedmetadata = async () => {
                try {
                    // Calculate dimensions maintaining aspect ratio
                    const aspectRatio = video.videoWidth / video.videoHeight;
                    let width = options.maxWidth;
                    let height = Math.round(width / aspectRatio);

                    if (height > options.maxHeight) {
                        height = options.maxHeight;
                        width = Math.round(height * aspectRatio);
                    }

                    const canvas = await this.createOffscreenCanvas(width, height);
                    const ctx = canvas.getContext('2d');
                    if (!ctx) throw new Error('Failed to get canvas context');

                    const stream = canvas.captureStream();
                    const mediaRecorder = new MediaRecorder(stream, {
                        mimeType: VIDEO_MIME_TYPE,
                        videoBitsPerSecond: options.videoBitrate
                    });

                    const chunks: Blob[] = [];
                    mediaRecorder.ondataavailable = (e) => {
                        if (e.data.size > 0) chunks.push(e.data);
                    };

                    mediaRecorder.onstop = () => {
                        const compressedBlob = new Blob(chunks, { type: VIDEO_MIME_TYPE });
                        URL.revokeObjectURL(video.src);
                        resolve(compressedBlob);
                    };

                    video.onplay = () => {
                        const processFrame = () => {
                            if (video.paused || video.ended) return;
                            ctx.drawImage(video, 0, 0, width, height);
                            requestAnimationFrame(processFrame);
                        };

                        mediaRecorder.start();
                        processFrame();
                    };

                    video.onerror = (e) => {
                        URL.revokeObjectURL(video.src);
                        reject(new Error(`Video processing error: ${e}`));
                    };

                    await video.play();
                } catch (error) {
                    URL.revokeObjectURL(video.src);
                    reject(error);
                }
            };
        });
    }

    static async generateThumbnail(blob: Blob, options = {
        width: 320,
        height: 180,
        quality: 0.7
    }): Promise<string> {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(blob);

            video.onloadedmetadata = async () => {
                try {
                    // Seek to 25% of the video
                    video.currentTime = video.duration * 0.25;

                    video.onseeked = async () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = options.width;
                        canvas.height = options.height;

                        const ctx = canvas.getContext('2d');
                        if (!ctx) throw new Error('Failed to get canvas context');

                        ctx.drawImage(video, 0, 0, options.width, options.height);
                        const thumbnailUrl = canvas.toDataURL('image/jpeg', options.quality);

                        URL.revokeObjectURL(video.src);
                        resolve(thumbnailUrl);
                    };
                } catch (error) {
                    URL.revokeObjectURL(video.src);
                    reject(error);
                }
            };

            video.onerror = (e) => {
                URL.revokeObjectURL(video.src);
                reject(new Error(`Thumbnail generation error: ${e}`));
            };
        });
    }
}