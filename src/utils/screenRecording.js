import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

let mediaRecorder;
let recordedChunks = [];
let isRecording = false;

export async function startScreenRecording() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { mediaSource: "screen" }
    });

    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    recordedChunks = [];
    isRecording = true;
    updateRecordingIndicator();

    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        console.log("Размер видео в реальном времени:", (blob.size / 1024 / 1024).toFixed(2), "MB");
      }
    };

    mediaRecorder.onstop = async () => {
      isRecording = false;
      updateRecordingIndicator();

      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      recordedChunks = [];
      console.log("Финальный размер видео:", (blob.size / 1024 / 1024).toFixed(2), "MB");

      await uploadRecording(blob);
    };

    mediaRecorder.start();
  } catch (error) {
    console.error("Ошибка при попытке начать запись экрана:", error);
  }
}

// Остановка записи и возврат ссылки на видео
export async function stopScreenRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    // Wait for upload and return the download URL
    return await new Promise((resolve, reject) => {
      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        recordedChunks = [];
        try {
          const downloadURL = await uploadRecording(blob);
          resolve(downloadURL);
        } catch (error) {
          reject(error);
        }
      };
    });
  } else {
    return null;
  }
}

// Функция для загрузки видео на Firebase
async function uploadRecording(blob) {
  try {
    const storage = getStorage();
    const videoRef = ref(storage, `videos/${Date.now()}.webm`);

    const snapshot = await uploadBytes(videoRef, blob);

    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    throw error;
  }
}

// Функция для обновления индикатора записи
function updateRecordingIndicator() {
  const recordingIndicator = document.getElementById("recordingIndicator");
  if (recordingIndicator) {
    recordingIndicator.style.display = isRecording ? "block" : "none";
  } else {
    console.warn("Элемент recordingIndicator не найден.");
  }
}
