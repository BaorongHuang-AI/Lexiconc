import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { PageLoading } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from 'umi';
import { history } from 'umi';
import defaultSettings from '../config/defaultSettings';
import { currentUser as queryCurrentUser } from './services/ant-design-pro/api';

import {ConfigProvider, notification} from "antd";
const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';
import  {RequestOptionsInit, ResponseError} from "umi-request";
import enUS from "@/locales/en-US";
// import {RequestConfig} from "../out/antd_electron-win32-x64/resources/app/src/.umi/plugin-request/request";

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

const reLogin = () => {
  console.log("relogin");
  // const { redirect } = getPageQuery();
  // Note: There may be security issues, please note
  if (window.location.pathname !== '/user/login') {
    // removeToken()
    history.replace({
      pathname: '/user/login',
      // search: stringify({
      //   redirect: window.location.href,
      // }),
    });
  }
}


const authHeaderInterceptor = (url: string, options: RequestOptionsInit) => {
  const token = localStorage.getItem("token");
  console.log("token");
  if(token!==null) {
    const authHeader = {Authorization: 'Token ' + token};
    // console.log(authHeader);
    return {
      url: `${url}`,
      options: {...options, interceptors: true, headers: authHeader},
    };
  }else{
    console.log("no token");
    reLogin();
    return;
  }
};


const codeMessage: { [status: string]: string } = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

const errorHandler = (error: ResponseError) => {
  const { response } = error;
  console.log(response);
  if (response && response.status) {
    const errorText = codeMessage[response.status] || response.statusText;
    const { status, url } = response;

    console.log( `请求错误 ${status}: ${url}`, errorText);
    notification.error({
      message: `请求错误 ${status}: ${url}`,
      description: errorText,
    });
  }

  if (!response) {
    notification.error({
      description: '您的网络发生异常，无法连接服务器',
      message: '网络异常',
    });
  }
  throw error;
};

export const request = {
  errorHandler,
  credentials: 'include',
  // 新增自动添加AccessToken的请求前拦截器
  requestInterceptors: [authHeaderInterceptor],
};
//
// request.interceptors.request.use(async (url, options) => {
//   if (
//     options.method === 'post' ||
//     options.method === 'put' ||
//     options.method === 'delete' ||
//     options.method === 'get'
//   ) {
//     const headers = {
//       'Content-Type': 'application/json',
//       Accept: 'application/json',
//       Authorization: 'Token ' + localStorage.getItem("token")
//     };
//     return {
//       url,
//       options: { ...options, headers },
//     };
//   }
// });

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    // try {
    //   const msg = await queryCurrentUser();
    //   localStorage.setItem("currentUser", JSON.stringify(msg.data));
    //   return msg.data;
    //
    // } catch (error) {
    //   // history.push("/welcome");
    //
    // }
    return {userid: 1, name:"test"};

  };
  // 如果不是登录页面，执行
  // if (history.location.pathname !== loginPath) {
  //   const currentUser = await fetchUserInfo();
  //   return {
  //     fetchUserInfo,
  //     currentUser,
  //     settings: defaultSettings,
  //   };
  // }
  return {
    // undefined,
    currentUser: {userid: '1', name:"test"},
    settings: defaultSettings,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    waterMarkProps: null,
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      // if (!initialState?.currentUser && location.pathname !== loginPath) {
      //   history.push(loginPath);
      // }
    },
    locale:"en-US",
    links: isDev
      ? [

        ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children, props) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          <ConfigProvider>
            {children}
          {!props.location?.pathname?.includes('/login') && (
            <></>
            // <SettingDrawer
            //   disableUrlParams
            //   enableDarkTheme
            //   settings={initialState?.settings}
            //   onSettingChange={(settings) => {
            //     setInitialState((preInitialState) => ({
            //       ...preInitialState,
            //       settings,
            //     }));
            //   }}
            // />
          )}
          </ConfigProvider>
        </>
      );
    },
    ...initialState?.settings,
  };
};
