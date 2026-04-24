import type { IconType } from "react-icons"
import {
  FiBookOpen,
  FiBriefcase,
  FiCamera,
  FiHome,
  FiSmartphone,
  FiTruck,
  FiWatch,
  FiGrid,
} from "react-icons/fi"
import { FaBabyCarriage } from "react-icons/fa";
import { FaBuilding } from "react-icons/fa";
import { MdOutlinePets } from "react-icons/md";
import { TbRibbonHealth } from "react-icons/tb";

export const iconMap: Record<string, IconType> = {
  smartphone: FiSmartphone,
  watch: FiWatch,
  home: FiHome,
  truck: FiTruck,
  work: FiBriefcase,
  camera: FiCamera,
  books: FiBookOpen,
  kids: FaBabyCarriage,
  building: FaBuilding,
  pets: MdOutlinePets,
  ribbonHealth: TbRibbonHealth,
}

export const defaultIcon: IconType = FiGrid;

export const popularCategories = [
  "Електроніка",
  "Одяг та взуття",
  "Дім та сад",
  "Авто",
  "Робота",
  "Хобі та відпочинок",
]

export type FooterGroup = {
  title: string
  links: string[]
}

export const footerGroups: FooterGroup[] = [
  {
    title: "Про Listify",
    links: ["Про нас", "Кар'єра", "Преса", "Блог"],
  },
  {
    title: "Підтримка",
    links: ["Центр допомоги", "Поради з безпеки", "Зв'язатися з нами", "Поширені питання"],
  },
  {
    title: "Юридична інформація",
    links: ["Умови користування", "Політика конфіденційності", "Політика cookie", "Відмова від відповідальності"],
  },
  {
    title: "Слідкуйте за нами",
    links: ["Facebook", "Twitter", "Instagram", "LinkedIn"],
  },
];

export const ListingStatus = {
  Draft: 0,
  Published: 1,
  Archived: 2,
} as const;

export type ListingStatus = typeof ListingStatus[keyof typeof ListingStatus];
