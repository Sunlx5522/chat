<template>
  <div class="login">
    <div class="card" :class="{ register: !isLogin }">
      <!-- login-card -->
      <div class="login-card">
        <i class="iconfont icon-qiehuan" @click="isLogin = !isLogin"></i>
        <img class="avatar" :src="require('@/assets/img/avatar.jpg')" alt="" />
        <div>
          <input type="text" v-model="loginInfo.userName" placeholder="请输入用户名" />
        </div>
        <div>
          <input type="password" v-model="loginInfo.password" placeholder="请输入密码" @keydown.enter="login" />
        </div>
        <div class="btn" @click="login">登录</div>
      </div>
      <!-- register-card -->
      <div class="register-card">
        <i class="iconfont icon-qiehuan" @click="isLogin = !isLogin"></i>
        <div class="reg-user-name">
          <a-upload
            name="file"
            list-type="picture-card"
            class="avatar-uploader upload-avatar"
            :show-upload-list="false"
            action="/api/files/upload_file"
            :before-upload="beforeUpload"
            @change="handleChange"
          >
            <img v-if="registerInfo.avatar" :src="registerInfo.avatar" alt="avatar" />
            <div v-else>
              <!-- <a-icon :type="imgLoading ? 'loading' : 'plus'" /> -->
              <loading-outlined v-if="imgLoading"></loading-outlined>
              <plus-outlined v-else></plus-outlined>
            </div>
          </a-upload>
          <input type="text" placeholder="取一个名字" v-model="registerInfo.userName" />
        </div>
        <div><input type="password" placeholder="输入你的密码" v-model="registerInfo.password" /></div>
        <div><input type="password" placeholder="确认你的密码" v-model="registerInfo.confirmPassword" /></div>
        <div><input type="text" placeholder="输入你的邮箱" v-model="registerInfo.email" @keydown.enter="signin" /></div>
        <div class="btn" @click="signin">注册</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { api_login, api_signin } from '@/api/user'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { defineComponent, onMounted, reactive, toRefs } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import useAUploadHook from '@/hooks/aUploadHook'

export default defineComponent({
  name: 'ChatLogin',
  components: { PlusOutlined, LoadingOutlined },
  setup() {
    const store = useStore()
    const router = useRouter()
    const state = reactive({
      loginInfo: {
        userName: '',
        password: '',
      },
      registerInfo: {
        avatar: '',
        userName: '',
        password: '',
        confirmPassword: '',
        email: '',
      },
      // 是否是登录状态 还是注册状态
      isLogin: true,
    })

    onMounted(() => {
      if (store.state.userInfo) {
        router.go(0)
      }
      store.state.socket?.disconnect()
    })

    // 点击登录的回调
    const login = async () => {
      // 判断是否存在空值
      for (var key in state.loginInfo) {
        if (!state.loginInfo[key as keyof typeof state.loginInfo].trim()) {
          message.warning(`${key}不能为空哦`)
          return
        }
      }

      let res = await api_login(state.loginInfo)
      if (res) {
        store.commit('setUserInfo', res.userInfo)
        router.push('/index')
      }
    }

    // 点击注册的回调
    const signin = async () => {
      const info = state.registerInfo
      // 判断是否存在空值
      for (let key in info) {
        if (!info[key as keyof typeof info].trim()) {
          message.warning(`${key}不能为空哦`)
          return
        }
      }

      if (info.password !== info.confirmPassword) {
        message.warning('两次密码不一致')
        return
      }

      // 正则校验邮箱
      let emailReg = /^[A-Za-z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
      if (!emailReg.test(info.email)) {
        message.warning('邮箱格式错误')
        return
      }

      let res = await api_signin(info)

      if (res) {
        message.success('注册成功')
        state.isLogin = true
        state.loginInfo = {
          userName: info.userName,
          password: '',
        }
      }
    }

    const { handleChange, beforeUpload, imgLoading } = useAUploadHook((response) => {
      state.registerInfo.avatar = response.src
    })

    return {
      ...toRefs(state),
      imgLoading,
      login,
      signin,
      handleChange,
      beforeUpload,
    }
  },
})
</script>

<style scoped>
.login {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: url('@/assets/img/login_background.jpg') no-repeat;
  background-position: bottom;
  background-size: cover;
  /* backdrop-filter: blur(10px); */
}

.card {
  position: relative;
  height: 360px;
  width: 280px;
  transform: perspective(800px) rotateY(0deg);
  transition: 0.6s all ease;
  transform-style: preserve-3d;
  box-shadow: 0 0px 20px 10px rgba(0, 0, 0, 0.15);
  border-radius: 5px;
}

.card > div {
  height: 100%;
  width: 100%;
  padding: 0 30px;
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  border-radius: 5px;
}

.login-card {
  background-color: #f5f5f5;
  backface-visibility: hidden;
  transform: translateZ(1px);
}

.login-card > div {
  width: 185px;
}

.register-card {
  background-color: #f5f5f5;
  transform: translateZ(-1px) rotateY(180deg);
  border-radius: 5px;
}

.register {
  transform: perspective(800px) rotateY(180deg);
}

.icon-qiehuan {
  position: absolute;
  right: 15px;
  top: 8px;
  font-size: 20px;
  transition: 0.3s transform ease;
}

.icon-qiehuan:hover {
  transform: scale(1.1);
}

.avatar {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 5px;
  margin: 20px;
}

input {
  border: 1px solid #ccc;
  padding: 5px 10px;
  margin: 5px 0;
  border-radius: 5px;
  width: 100%;
}

input:focus {
  outline: none;
}

.btn {
  /* background-color: #1aad19; */
  background-color: #3fa7e4;
  color: white;
  padding: 7px 0;
  margin: 18px 0;
  width: 100%;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.2s all ease;
}

.btn:hover {
  /* background-color: #129611; */
  background-color: #2495ce;
}

.upload-avatar {
  height: 50px;
  width: 50px;
  min-width: 50px;
  margin-right: 10px;
}

.upload-avatar /deep/ .ant-upload {
  width: 100%;
  height: 100%;
  padding: 0 !important;
  display: flex;
}

.upload-avatar /deep/ .ant-upload:hover {
  border-color: #2495ce;
}

.upload-avatar /deep/ .ant-upload span {
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 5px;
}

.reg-user-name {
  display: flex;
  align-items: center;
  width: 186px;
}

.reg-user-name input {
  flex: 1;
}

.register-card > div {
  margin: 3px;
  width: 185px;
}

.register-card .btn {
  margin-top: 20px;
  margin-bottom: 0;
}
</style>
