import { domain, findHandler, mainKey } from "./utils/configuration";
import { errorColor, showNotification } from "./utils/notifications";
import { buildRow, copyTextToClipboard, todayDate } from "./utils/tools";
import { SourceHandler } from "./sources/source-handler";
import { registeredHandlers } from "./sources/handlers-registrar";

async function copyData() {
  const isValid = findHandler();
  if (!isValid) {
    const message = `${domain} is not supported at the moment`;
    showNotification(message, errorColor, true);
    console.error(message);
    return;
  }

  const sourceHandler: SourceHandler | null = findHandler();

  if (sourceHandler === null) {
    showNotification(
      `No source handler for the ${domain} found`,
      errorColor,
      true
    );
    return;
  }

  const companyName = sourceHandler.findCompanyName();
  const companyLink = sourceHandler.findCompanyLink();
  const jobTitle = sourceHandler.findJobTitle();
  const jobDescription = sourceHandler.findJobDescription();
  const jobLink = sourceHandler.findJobLink();
  const rangeStart = sourceHandler.findRangeStart();
  const rangeEnd = sourceHandler.findRangeEnd();
  const location = sourceHandler.findLocation();
  const typeJob = sourceHandler.findTypeJob();

  console.log(`
Company name: "${companyName}"
Company link: "${companyLink}"
Job title: "${jobTitle}"
Job Description: "${jobDescription}"
Job link: "${jobLink}"
Range start: "${rangeStart}"
Range end: "${rangeEnd}"
Location: "${location}"
TypeJob: "${typeJob}"`);

  if (
    companyName !== "" ||
    companyLink !== "" ||
    jobTitle !== "" ||
    jobDescription !== "" ||
    jobLink !== "" ||
    rangeStart !== "" ||
    rangeEnd !== "" ||
    location !== "" ||
    typeJob !== ""
  ) {
    const { textVersion, htmlVersion }  = buildRow(
        jobTitle,
        jobLink,
        companyName,
        companyLink,
        jobDescription,
        rangeStart,
        rangeEnd,
        todayDate(),
        location,
        typeJob
    );

    await copyTextToClipboard(
      textVersion, htmlVersion
    );
    showNotification();
  } else {
    showNotification("No data found", errorColor, true);
  }
}

document.addEventListener("keydown", async function (event) {
  if ((event.ctrlKey || event.metaKey) && event.key === mainKey) {
    try {
      await copyData();
    } catch (error) {
      console.error(
        "Error on copying the data.\nIf you seeing this message all the time, please contact with me:\nalphamikle@gmail.com\nand attach this error information:",
        "\n",
        error
      );
      showNotification(
        "Error on copying. See the console for more details",
        errorColor,
        true
      );
    }
  }
});

console.log(`JobSnap is working!`);
