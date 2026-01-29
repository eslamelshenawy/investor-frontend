export interface NavItem {
  label: string;
  href: string;
}

export interface Metric {
  label: string;
  value: number;
  icon: 'view' | 'download' | 'star';
}

export interface Tag {
  label: string;
  lang: 'ar' | 'en';
}

export interface MetadataItem {
  key: string;
  value: string;
  icon?: string;
}

export interface ActivityData {
  date: string;
  views: number;
  downloads: number;
}