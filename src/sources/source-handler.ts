export interface SourceHandler {
  get code(): string;

  findCompanyName(): string;

  findCompanyLink(): string;

  findJobTitle(): string;

  findJobDescription(): string;

  findLocation(): string;

  findTypeJob(): string;

  findJobLink(): string;

  findRangeStart(): string;

  findRangeEnd(): string;
}
