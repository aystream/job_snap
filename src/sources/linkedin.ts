import { clearUrl, hourRateToYear } from "../utils/tools";
import { SourceHandler } from "./source-handler";

export type LinkedInSalaryPerHour = "hr";

export type LinkedInSalaryPerYear = "yr";

export type LinkedInSalaryType = LinkedInSalaryPerHour | LinkedInSalaryPerYear;

export type LinkedInSalaryRangeFrom = number;

export type LinkedInSalaryRangeTo = number;

export type LinkedInSalaryDetails = [
  LinkedInSalaryType,
  LinkedInSalaryRangeFrom,
  LinkedInSalaryRangeTo | null
];

const jobPrefixRegExp = /^\s*\W*/;
const jobPostfixRegExp = /\s*\W*$/;
const salaryRegExp = /(\$[0-9,]+)(\/(yr|hr))(\s*-\s*\$[0-9,]+)?/g;

const salaryPerHour: LinkedInSalaryPerHour = "hr";
const salaryPerYear: LinkedInSalaryPerYear = "yr";

export class LinkedInSourceHandler implements SourceHandler {
  get code(): string {
    return "linkedin";
  }

  findCompanyName(): string {
    return this.companyNode?.textContent ?? "";
  }

  findCompanyLink(): string {
    return this.companyNode?.href ?? "";
  }

  findJobTitle(): string {
    return (this.jobNode?.textContent ?? "")
      .replace(jobPrefixRegExp, "")
      .replace(jobPostfixRegExp, "");
  }

  findJobDescription(): string {
    return this.jobDescriptionNode?.textContent ?? "Description not found";
  }

  findLocation(): string {
    return this.locationDescription;
  }

  findTypeJob(): string {
    return this.typeJobDescription;
  }

  findJobLink(): string {
    if (this.isJobPageLink) {
      return clearUrl(window.location.href);
    }

    const node = this.jobNode as HTMLLinkElement | null;
    const url = node?.href ?? "";
    if (url.length === 0) {
      return "";
    }
    return clearUrl(url);
  }

  findRangeStart(): string {
    const details = this.salaryDetails;
    if (details === null) {
      return "";
    }
    const salaryType = details[0];
    const rangeFrom = details[1];

    if (salaryType === salaryPerYear) {
      return `=${rangeFrom}`;
    } else if (salaryType === salaryPerHour) {
      return hourRateToYear(rangeFrom);
    }
    return "";
  }

  findRangeEnd(): string {
    const details = this.salaryDetails;
    if (details === null) {
      return "";
    }
    const salaryType = details[0];
    const rangeFrom = details[2];

    if (rangeFrom === null) {
      return "";
    }

    if (salaryType === salaryPerYear) {
      return `=${rangeFrom}`;
    } else if (salaryType === salaryPerHour) {
      return hourRateToYear(rangeFrom);
    }
    return "";
  }

  private get isJobPageLink(): boolean {
    return window.location.href.includes("/jobs/view/");
  }

  private get companyNode(): HTMLLinkElement | null {
    if (this.isJobPageLink) {
      return document.querySelector(
        ".job-details-jobs-unified-top-card__primary-description-without-tagline .app-aware-link"
      );
    }

    return document.querySelector(
      ".job-details-jobs-unified-top-card__primary-description-container .app-aware-link"
    );
  }

  private get jobNode(): HTMLLinkElement | Element | null {
    const jobParentNode = document.querySelector(
      ".job-details-jobs-unified-top-card__job-title"
    );
    if (this.isJobPageLink) {
      return jobParentNode;
    }
    return jobParentNode?.querySelector("a") ?? null;
  }

  private get jobDescriptionNode(): HTMLLinkElement | Element | null {
    return document.querySelector(
      ".jobs-description-content__text"
    ) as HTMLElement | null;
  }

  private get locationDescription(): string {
    const locationElement = document.querySelector(
      ".job-details-jobs-unified-top-card__primary-description-without-tagline"
    ) as HTMLLinkElement | null;
    if (!locationElement) return "Location not found";

    // Extracting the complete text content of the container element
    const fullDescriptionText = locationElement.innerText.trim();
    // Splitting the text content based on the "·" delimiter to isolate different parts
    const parts = fullDescriptionText.split("·");

    // Assuming the location is always the second part after splitting
    if (parts.length >= 3) {
      const locationPart = parts[1].trim();
      // Further cleaning if necessary
      return locationPart;
    }
    return "Location not found";
  }

  private get typeJobDescription(): string {
    const jobTypeElements = document.querySelectorAll(
      ".job-details-jobs-unified-top-card__job-insight--highlight span.ui-label span[aria-hidden=\"true\"]"
    );
    return Array.from(jobTypeElements)
      .map((element) => element.textContent)
      .join(", ");
  }

  private get salaryDetails(): LinkedInSalaryDetails | null {
    const elements = document.querySelectorAll(
      ".job-details-jobs-unified-top-card__job-insight"
    );
    let result: LinkedInSalaryDetails | null = null;

    const searchInNode = (node: Element | ChildNode) => {
      if (result !== null && result.length > 0) {
        return;
      }

      if (node.nodeType === Node.TEXT_NODE) {
        let match;
        while ((match = salaryRegExp.exec(node.nodeValue ?? "")) !== null) {
          let salaryType: LinkedInSalaryType | null = null;
          if (match[3] === salaryPerHour || match[3] === salaryPerYear) {
            salaryType = match[3] as LinkedInSalaryType;
          }
          const firstAmount = parseFloat(
            match[1].replace(/\$/g, "").replace(/,/g, "")
          );
          let secondAmount = null;

          if (match[4]) {
            secondAmount = parseFloat(
              match[4]
                .replace(/\$/g, "")
                .replace(/,/g, "")
                .replace(/-/g, "")
                .trim()
            );
          }

          if (secondAmount && salaryType !== null) {
            result = [salaryType, firstAmount, secondAmount];
          } else if (salaryType !== null) {
            result = [salaryType, firstAmount, null];
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.childNodes).forEach((node) => searchInNode(node));
      }
    };

    for (const element of elements) {
      if (result !== null) {
        break;
      }
      searchInNode(element);
    }

    return result;
  }
}
