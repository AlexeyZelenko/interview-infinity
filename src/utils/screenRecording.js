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
    console.log("Запись начата.", { isRecording });

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
      console.log("Запись остановлена.", { isRecording });

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
    console.log("Запись остановлена вручную.");

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
    console.log("Нет активной записи для остановки.");
    return null;
  }
}

// Функция для загрузки видео на Firebase
async function uploadRecording(blob) {
  try {
    const storage = getStorage();
    const videoRef = ref(storage, `videos/${Date.now()}.webm`);

    console.log("Начало загрузки видео на Firebase Storage...");

    const snapshot = await uploadBytes(videoRef, blob);
    console.log("Видео успешно загружено в Firebase Storage.");

    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("Ссылка на загруженное видео:", downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("Ошибка при загрузке видео на Firebase Storage:", error);
    throw error;
  }
}

// Функция для обновления индикатора записи
function updateRecordingIndicator() {
  const recordingIndicator = document.getElementById("recordingIndicator");
  if (recordingIndicator) {
    recordingIndicator.style.display = isRecording ? "block" : "none";
    console.log("Статус индикатора записи:", isRecording ? "Активен" : "Неактивен");
  } else {
    console.warn("Элемент recordingIndicator не найден.");
  }
}
