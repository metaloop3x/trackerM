import streamlit as st
import google.generativeai as genai

# === 設定區 ===
# 這裡設定你的登入密碼，防止別人亂用
MY_PASSWORD = st.secrets["APP_PASSWORD"] 

# === 頁面設定 ===
st.set_page_config(page_title="我的私人 AI 助理")
st.title("🤖 我的私人 AI 助理")

# === 密碼檢查機制 ===
if "authenticated" not in st.session_state:
    st.session_state.authenticated = False

if not st.session_state.authenticated:
    password = st.text_input("請輸入密碼解鎖", type="password")
    if st.button("登入"):
        if password == MY_PASSWORD:
            st.session_state.authenticated = True
            st.rerun()
        else:
            st.error("密碼錯誤")
    st.stop() # 如果沒登入，程式就停在這裡，不載入下面的 AI

# === AI 核心邏輯 (登入後才看得到) ===
# 讀取你的 API Key
genai.configure(api_key=st.secrets["GOOGLE_API_KEY"])
model = genai.GenerativeModel('gemini-1.5-flash')

# 初始化聊天紀錄
if "messages" not in st.session_state:
    st.session_state.messages = []

# 顯示歷史訊息
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# 接收使用者輸入
if prompt := st.chat_input("請輸入你的問題..."):
    # 顯示你的訊息
    with st.chat_message("user"):
        st.markdown(prompt)
    st.session_state.messages.append({"role": "user", "content": prompt})

    # AI 回答
    try:
        response = model.generate_content(prompt)
        with st.chat_message("assistant"):
            st.markdown(response.text)
        st.session_state.messages.append({"role": "assistant", "content": response.text})
    except Exception as e:
        st.error(f"發生錯誤: {e}")
