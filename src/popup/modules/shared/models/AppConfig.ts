import { ActiveTab } from '@app/popup/modules/shared';

export class AppConfig {
  constructor(
    public readonly group: string | undefined,
    public readonly activeTab: ActiveTab,
  ) {}
}
