// Aguarda o carregamento do DOM e adiciona eventos de teclado e clique
document.addEventListener("DOMContentLoaded", () => {
    // Permite enviar mensagem ao pressionar "Enter"
    document.getElementById("user-input").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            sendMessage();
        }
    });
 
    // Ativa ou desativa a resposta por voz ao clicar no botão correspondente
    document.getElementById("voice-toggle").addEventListener("click", function () {
        voiceEnabled = !voiceEnabled;
        this.innerText = voiceEnabled ? "🔊 Voz Ativada" : "🔇 Voz Desativada";
    });
});
 
let voiceEnabled = false; // Variável que controla se a voz do chatbot está ativada
 
// Função que envia a mensagem do usuário para o servidor Flask
function sendMessage() {
    const userInput = document.getElementById("user-input").value;
    if (!userInput) return;
 
    // Adiciona a mensagem do usuário no chat
    addMessage("Usuário", userInput);
    document.getElementById("user-input").value = "";
 
    // Envia a mensagem ao backend Flask e aguarda resposta
    fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput })
    })
    .then(response => response.json())
    .then(data => {
        // Adiciona a resposta do chatbot no chat
        addMessage("Bot", data.response);
       
        // Se a voz estiver ativada, fala a resposta do chatbot
        if (voiceEnabled) {
            speak(data.response);
        }
    })
    .catch(error => console.error("Erro ao enviar mensagem:", error));
}
 
// Função que adiciona mensagens ao chat
function addMessage(sender, message) {
    const chatBox = document.getElementById("chat-box");
    const messageElement = document.createElement("div");
 
    // Formata a mensagem com o nome do remetente
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatBox.appendChild(messageElement);
 
    // Mantém a rolagem no final do chat
    chatBox.scrollTop = chatBox.scrollHeight;
}
 
// Função que envia um arquivo PDF para o servidor Flask
function uploadPDF() {
    const fileInput = document.getElementById("pdf-upload");
    if (!fileInput.files.length) return;

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        
        // Exibir conteúdo do PDF no chat
        if (data.content) {
            addMessage("Bot", "PDF anexado com sucesso! O conteúdo será usado para responder às suas perguntas.");
        }
    })
    .catch(error => console.error("Erro ao enviar PDF:", error));
}
 
// Função que inicia o reconhecimento de voz do usuário
function startVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Seu navegador não suporta reconhecimento de voz.");
        return;
    }
 
    // Inicializa o reconhecimento de voz
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "pt-BR";
    recognition.start();
 
    // Quando o reconhecimento captura um resultado, insere no input e envia a mensagem
    recognition.onresult = function(event) {
        document.getElementById("user-input").value = event.results[0][0].transcript;
        sendMessage();
    };
 
    // Captura possíveis erros no reconhecimento de voz
    recognition.onerror = function(event) {
        console.error("Erro no reconhecimento de voz:", event.error);
    };  
}
 
// Função que remove caracteres especiais do texto
function cleanText(text) {
    return text.replace(/[*_#@<>[\]{}()|]/g, ""); // Remove símbolos comuns
}
 
// Função que transforma texto em fala (TTS - Text-to-Speech)
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR"; // Define o idioma para português
    utterance.rate = 1.6; // Aumenta a velocidade da fala (1.0 é o padrão, pode ser ajustado entre 0.1 e 10)  
    speechSynthesis.speak(utterance);
}