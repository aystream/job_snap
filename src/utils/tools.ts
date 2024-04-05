import { holidays, workingHours, workingHoursInTheYear } from "./configuration";

export function todayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export async function copyTextToClipboard(text: string, html: string) {
  try {
    const data = {
      'text/plain': new Blob([text], { type: 'text/plain' }),
      'text/html': new Blob([html], { type: 'text/html' })
    };
    const item = new ClipboardItem(data);
    await navigator.clipboard.write([item]);
    console.log("Job data copied!");
  } catch (err) {
    console.error(`Error on copy job data to clipboard`, err);
  }
}

export function buildRow(
  jobTitle: string,
  jobLink: string,
  companyName: string,
  companyLink: string,
  jobDescription: string,
  salaryFrom: string,
  salaryTo: string,
  date: string,
  location: string,
  typeJob: string
) {
  // Clean up the job description by trimming and collapsing spaces
  const cleanedDescription = jobDescription.replace(/\s+/g, ' ').trim();

  // Convert newlines to space for the plain text version
  const textJobDescription = cleanedDescription.replace(/(\r\n|\n|\r)/gm, ' ');

  // Replace newlines with <br> for HTML
  const htmlJobDescription = jobDescription.replace(/(\r\n|\n|\r)/gm, '<br>');

  // Build the HTML table
  const htmlVersion = `
    <table>
      <tr>
        <td><a href="${companyLink}">${companyName}</a></td>
        <td>${date}</td>
        <td>${jobTitle}</td>
        <td>${jobLink}</td>
        <td>${htmlJobDescription}</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td>${location}</td>
        <td>${typeJob}</td>
      </tr>
    </table>
  `;

  // Now construct both the plain text and HTML versions
  const textVersion = `${companyName}\t${date}\t${jobLink}\t${jobTitle}\t${textJobDescription}\t${salaryFrom}\t${salaryTo}\t${location}\t${typeJob}`;
  return {textVersion, htmlVersion};
}

export function clearUrl(rawUrl: string) {
  const parsedUrl = new URL(rawUrl);
  return `${parsedUrl.origin}${parsedUrl.pathname}`.trim();
}

export function hourRateToYear(rate: number): string {
  return `=${rate}*(${workingHoursInTheYear}-${holidays}*${workingHours})`;
}
