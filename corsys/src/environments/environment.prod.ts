
import { IAppConfig } from '../app/models/viewModels';
import { resouceEndPoints, baseLocation } from './resourceEndPoints';
export const environment: IAppConfig = {
  isProduction: true,
  adalConfig : {
    tenant: 'adfs',
    instance: 'https://sts006.csyshcc043.co.uk/',
    clientId: 'https://portal.corsys.com/',
    endpoints: resouceEndPoints,
    redirectUri: baseLocation
  },
  rolesUrl: '/roles',
  appsUrl: '/apps',
  casesUrl: '/cases',
  // casesCountUrl:'/cases/casecount',
  caseDetailUrl: '/casedetails',
  scansUrl: '/scan',
  userUrl: '/users',
  settingsMetadataUrl: '/platform/metadata',
  settingsMetadataCountryUrl: '/platform/metadata/countries',
  settingsUrl: '/settings/general',
  analysisUrl: '/analysis',
  attachmentUrl: '/files',
  opAdminUrl:'/opadmin/settings',
  deviceLicenseInfo: '/devices',
  locationsInfo:   '/locations',
  auditUrl:'/users/logout',
  lineChartUrl: '/dashboard/profiler',
  operationDashboardKPI: '/dashboard/operational',
  historgramUrl: '/dashboard/operational/histogram'
};

