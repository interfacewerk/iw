import { ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FxService } from './services/fx.service';
import { FX_NOTIFIER, AlertNotifier } from './providers/notifier';
import { FX_CONFIRM, WindowConfirm } from './providers/confirm';

@NgModule({
  imports: [CommonModule],
  providers: [FxService],
})
export class FxModule {
  static forRoot(params: {
    notifier?: Omit<Provider, 'provide'>;
    confirm?: Omit<Provider, 'provide'>;
  }): ModuleWithProviders<FxModule> {
    return {
      ngModule: FxModule,
      providers: [
        {
          ...(params.notifier || { useClass: AlertNotifier }),
          provide: FX_NOTIFIER,
        } as Provider,
        {
          ...(params.confirm || { useClass: WindowConfirm }),
          provide: FX_CONFIRM,
        } as Provider,
      ],
    };
  }
}
