import { expInfo } from "../settings";

export const TEXT = {
  welcome: {
    en: `<div class='main'>
    <h1 class='title'>Welcome!</h1>
    <p class='fb-text'>
      Thank you very much for participating in this experiment.
    </p>
    </div>`,
    de: `<div class='main'>
    <h1 class='title'>Willkommen!</h1>
    <p class='fb-text'>
      Vielen Dank für Ihre Teilnahme an diesem Experiment.
    </p>
    </div>`,
    cn: `<div class='main'>
    <h1 class='title'>欢迎您参与本实验!</h1>
    </div>`
  },
  blockBreak: function (
    breakType: 'betweenTrials' | 'postPractice' | 'betweenBlocks',
    loopValue: number | null,
    blocksCreated: number | null,
    repetitions: number | null
  ) {
    if (breakType === 'betweenTrials') {
      return `<div class='main'>
        <h1 class='title'>Take a break</h1>
        <p class='fb-text'>
          Good job! You have completed ${loopValue}/${repetitions} of the trials, 
          within block ${blocksCreated} out of ${expInfo.DESIGN.nBLOCKS} total blocks. 
          Take a few seconds to rest before you move on with more trials. 
          When you feel ready, click on the button to continue.
        </p>
        <br>
      </div>`;
    }

    if (breakType === 'postPractice') {
      return `<div class='main'>
        <h1 class='title'>Ready for more?</h1>
        <p class='fb-text'>
          Great, these were the practice trials! 
          When you feel ready, click on the button to continue with the main trials.
        </p>
        <br>
      </div>`;
    }

    if (breakType === 'betweenBlocks') {
      return `<div class='main'>
        <h1 class='title'>Take a break</h1>
        <p class='fb-text'>
          Excellent! You have completed block 1 out of ${expInfo.DESIGN.nBLOCKS} total blocks. 
          Take a few seconds to rest before you move on to the next block.
          When you feel ready, click on the button to continue.
        </p>
        <br>
      </div>`;
    }
  },

  /**
   * Announces what will happen in the upcoming block.
   * We now distinguish between 'combined' and 'split' blocks.
   * For the 'split' block, we also mention the recall order (ABBA vs random).
   */
  blockInfo: function (
    blockType: 'combined' | 'split',
    recallOrder: string | null,
    trialOrder: string,
    blockNumber: number
  ) {
// Combined block text
if (blockType === 'combined') {
  return `<div class='main'>
    <h1 class='title'>What's in block ${blockNumber}?</h1>
    <p class='fb-text'>
      In this <strong>combined</strong> block, you will see colored discs.
      Sometimes you will see <strong>3 discs</strong> at once, and sometimes <strong>6 discs</strong> at once.
      After each presentation, you will be asked to reproduce the colors of two of the discs.
      You will first complete some practice trials before moving on to the main trials.
      When you feel ready, click on the button to continue.
    </p>
    <br>
  </div>`;
}

// Split block text
if (blockType === 'split') {
  // If the recall order is random
  if (recallOrder === 'random') {
    return `<div class='main'>
      <h1 class='title'>What's in block ${blockNumber}?</h1>
      <p class='fb-text'>
        In this <strong>split</strong> block, you will first see <strong>3 discs</strong> on the left side of the screen,
        then <strong>3 discs</strong> on the right side.
        Afterwards, you will be tested on the colors of two of these discs in a <strong>random</strong> order.
        You will first complete some practice trials before moving on to the main trials.
        When you feel ready, click on the button to continue.
      </p>
      <br>
    </div>`;
  } 
  // If the recall order is ABBA (or any other predictable pattern)
  else {
    return `<div class='main'>
      <h1 class='title'>What's in block ${blockNumber}?</h1>
      <p class='fb-text'>
        In this <strong>split</strong> block, you will first see <strong>3 discs</strong> on the left side of the screen,
        then <strong>3 discs</strong> on the right side.
        Afterwards, you will be tested on the colors of two discs:
        first on a disc from the left side, then on a disc from the right side.
        You will first complete some practice trials before moving on to the main trials.
        When you feel ready, click on the button to continue.
      </p>
      <br>
    </div>`;
  }
}
    // Fallback in case something goes wrong
    return `<div class='main'>
      <h1 class='title'>Block ${blockNumber}</h1>
      <p class='fb-text'>
        We are preparing the next block. 
        Click "Continue" if you are ready.
      </p>
      <br>
    </div>`;
  },
  startPractice: {
    en: `<div class='main'>
        <h1 class='title'>Practice</h1>
        <p class='fb-text'>We will do some practice to get familiar with the experiment.</p>
      </div>`,
    de: `<div class='main'>
        <h1 class='title'>Übung</h1>
        <p class='fb-text'>Wir werden nun einige Übungen machen, damit Sie mit dem Experiment vertraut werden.</p>
      </div>`,
    cn: `<div class='main'>
        <h1 class='title'>练习环节</h1>
        <p class='fb-text'>接下来我们将进行一些练习以熟悉实验流程。</p>
      </div>`,
  },

  startExperiment: {
    en: `<div class='main'>
        <h1 class='title'>Experiment</h1>
        <p class='fb-text'>Good job! Now we will start running the experiment.</p>
      </div>`,
    de: `<div class='main'>
        <h1 class='title'>Experiment</h1>
        <p class='fb-text'>Gut gemacht! Jetzt beginnen wir mit dem Experiment.</p>
      </div>`,
    cn: `<div class='main'>
        <h1 class='title'>实验环节</h1>
        <p class='fb-text'>练习结束！现在我们将开始进行正式实验。</p>
      </div>`,
  },

  startTrial: {
    en: ` <p>The next trial will start in <span id="clock" style="color:red">10</span> seconds.</p>
    <p>Press the space bar to start directly.</p>`,
    de: ` <p>Der nächste Durchgang beginnt in <span id="clock" style="color:red">10</span> Sekunden.</p>
    <p>Drücken Sie die Leertaste, um direkt zu beginnen.</p>`,
    cn: ` <p>下一个试次将在 <span id="clock" style="color:red">10</span> 秒后开始。</p>
    <p>按下空格键后将直接开始</p>`,
  },

  continueButton: {
    en: ["Continue"],
    de: ["Weiter"],
    cn: ["继续"],
  },

  prevButton: {
    en: ["Previous"],
    de: ["Zurück"],
    cn: ["上一页"],
  },

  nextButton: {
    en: ["Next"],
    de: ["Weiter"],
    cn: ["下一页"],
  },

  submitButton: {
    en: "Submit",
    de: "Bestätigen",
    cn: "提交",
  },
  
  fullScreen: {
    en: "The experiment will switch to full screen",
    de: "Das Experiment wechselt in den Vollbildmodus",
    cn: "即将进入全屏模式",
  },

  repeatedPart: {},
};

// The information for different situations at the end of the experiment
export const END_INFO = {
  failedResize: {
    en: `<div class="main">
    <h1 class="title">Experiment discontinued</h1>
    <p>
        Unfortunately, your window size is too small to continue the experiment.
        we therefore have to end this experiment and we cannot grant you any course credit.
        If you have any questions, please contact the researcher.
    </p>
    </div>`,
    cn: `<div class="main">
    <h1 class="title">实验中止</h1>
    <p>
        很抱歉，您的窗口尺寸过小，无法继续实验。
        我们不得不结束此实验，无法为您提供任何课程学分。
        如果您有任何问题，请联系研究人员。
    </p>
    </div>`,
  },

  failed: {
    en: `<div class="main">
    <h1 class="title">Failed Attention Check </h1>
    <p>
        Unfortunately, you have left the tab or browser window more often than allowed.
        As we told you at the beginning of the experiment,
        we therefore have to end this experiment prematurely and we cannot grant you any course credit.
        If you have any questions, please contact the researcher.
    </p>
    </div>`,
    de: `<div class="main">
    <h1 class="title">Fehlgeschlagener Aufmerksamkeitstest</h1>
    <p>
        Leider haben Sie das Browser-Tab oder das Browserfenster öfter verlassen als erlaubt.
        Wie wir Ihnen zu Beginn des Experiments mitgeteilt haben,
        müssen wir das Experiment daher vorzeitig beenden und können Ihnen keine Versuchspersonenstunden gutschreiben.
        Wenn Sie Fragen haben, wenden Sie sich bitte an die Studienleitung.
    </p>
    </div>`,
    cn: `<div class="main">
    <h1 class="title">实验中止</h1>
    <p>
        很抱歉，由于您离开标签或浏览器窗口的次数超过了最大值，实验被迫中止。
        您将无法获得实验时长或被试费。如果您有任何问题，请联系主试。
    </p>
    </div>`,
  },

  completedOnline: {
    en: `<div class="main">
    <h1 class="title">Congratulations!</h1>
    <p>
        You have successfully completed the experiment! 
        We are now transferring data to the server. 
        Please copy the following completion code: ${expInfo.CODES.OFFLINE}. 
        If the window is not redirected to Prolific after 5 minutes, 
        you can just close it and submit the completion code to Prolific.
    </p>
    </div>`,
    cn: `<div class="main">
    <h1 class="title">实验结束</h1>
    <p>
        恭喜你顺利完成实验！我们正在将数据上传至服务器。
        请复制以下完成代码：${expInfo.CODES.OFFLINE}。
        如果窗口在5分钟内未重定向到Prolific，请直接关闭窗口并将完成代码提交至Prolific。
    </p>
    </div>`,
  },

  completedOffline: {
    en: `<div class="main">
          <p h1 class="title">Congratulation!(Offline Mode)</h1>
          <p class="body-center">
          You have successfully completed the experiment while in offline mode.
          Your data failed to transfer to the server due to network issues.
          It has been automatically downloaded to your "Downloads" folder.
          Please contact the researcher for further assistance.
          </p>
          </div>`,
    cn: `<div class="main">
          <p h1 class="title">恭喜你！（离线模式）</h1>
          <p class="body-center">
          您已成功完成了实验，但是由于网络问题，您的数据未能上传至服务器。
          数据已自动下载至您的“下载”文件夹，请联系研究人员以获取进一步的帮助。
          </p>
          </div>`,
  },
};


export const SURVEY_INFO = {
  TITLE_INFO: {
    cn: `<h1 class="title">事后问卷</h1>`,
    en: `<h1 class="title">Post-Experiment Questionnaire</h1>`,
  },
  DESCRIPTION: {
    cn: `<div class="main">本问卷的内容仅用于实验数据的处理，对您是否能够获取实验报酬没有影响。请您如实填写。</div>`,
    en: `<div class="main">
    This questionnaire is only used for the processing of experimental data 
    and has no effect on whether you can receive the credit. 
    Please fill in truthfully.</div>`,
  },

  AGE_QUES: {
    en: "How old are you?",
    de: "Wie alt sind Sie",
    cn: "您的年龄是？",
  },

  SEX_QUES: {
    en: "What is your sex?",
    de: "Was ist Ihr Geschlecht?",
    cn: "您的性别是？",
  },

  SEX_OPT: {
    en: ["Male", "Female", "Other"],
    de: ["Männlich", "Weiblich", "Andere"],
    cn: ["男", "女", "其他"],
  },

  STRATEGY_QUES: {
    cn: "您在实验中是否采用了某些策略来帮助记忆？",
    en: "Did you use any strategies to help you remember the colors or orientations?",
  },

  ATTENTION_QUES: {
    cn: "在实验过程中，您是否受到了外界环境的干扰？",
    en: "Were you distracted during the experiment? THIS DOES NOT AFFECT YOUR COMPENSATION. Please answer truthfully",
  },
  ATTENTION_OPT: {
    cn: ["是", "否"],
    en: ["Yes", "No"],
  },

  EFFORT_QUES: {
    en: "How much effort did you put into the trials? THIS DOES NOT AFFECT YOUR COMPENSATION. Please answer truthfully",
    cn: "您在实验中投入了多少精力？",
  },
  EFFORT_OPT: { 
    en: ["None at all", "A little", "Some", "A lot", "A great deal"],
    cn: ["没有", "一点", "一些", "很多", "非常多"],
  },

  COMMENT_QUES: {
    cn: "您对本次实验是否有任何建议或意见？",
    en: "Do you have any suggestions or comments on this experiment?",
  },
};
