
export type Paginado<T> = { data?: T[]; meta?: { currentPage?: number; lastPage?: number; perPage?: number; total?: number } };

export type AuthMe = { authId?: string; userId?: string | null; shortName?: string | null; status?: string | null; hasSubscription?: boolean; roles?: string[] };
export type SuscripcionUsuario = {
  planName?: string; billingCycle?: string; status?: unknown; amount?: string; currency?: string;
  startDate?: string; endDate?: string; renewDate?: string; subscriptionDate?: string; isConcurrent?: boolean;
  origin?: 'YOKI' | 'AKITA' | string; paymentMethodId?: string; savedCards?: TarjetaGuardada[];
  oportunitiesPerRaffle?: { number?: number; text?: string }; referenceId?: string; paymentGateway?: string;
};
export type TarjetaGuardada = { id: string; cardBrand?: string; lastFourDigits?: string; isDefault?: boolean };
export type Usuario = {
  email?: string; firstName?: string; paternalSurname?: string; maternalSurname?: string;
  documentType?: string; documentNumber?: string; phone?: string; birthDate?: string;
  address?: string; gender?: Genero | string; districtUbigeoCode?: string; carPlate?: string; publicId?: string;
  profileCompletion?: { percentage?: number; completedFields?: string[]; missingFields?: string[] };
  savedCards?: TarjetaGuardada[]; subscription?: SuscripcionUsuario | null;
};
export const GENEROS = ['Femenino', 'Masculino', 'No binario', 'Prefiero no decir'] as const;
export type Genero = (typeof GENEROS)[number];
export type Utm = { utm_source: string; utm_medium: string; utm_campaign: string; utm_content: string; utm_term: string };
export type RegistroDTO = {
  email: string; password: string; utmParams: Utm;
  consentAcceptedPrivacyPolicy: boolean; consentSubscribeOffers: boolean;
  consentShareDataWithPartners: boolean; consentReceivePersonalizedPromotions: boolean;
};
export type PerfilOpcionalDTO = { address?: string; gender?: Genero; districtUbigeoCode?: string; carPlate?: string };
export type Ubigeo = { code: string; name?: string };
export type DatosPersonalesDTO = {
  firstName: string; paternalSurname: string; maternalSurname: string;
  documentType: 'DNI' | 'PASSPORT' | 'FOREIGN_ID_CARD'; documentNumber: string; phone: string; utmParams: Utm; birthDate: string;
};

export type LanasMe = {
  balance?: number; solesEquivalent?: number | null; lockedLanas?: number; graceEndsAt?: string | null;
  nextExpiration?: { amount?: number; date?: string } | null; status?: string; canSpend?: boolean; chancePriceLanas?: number | null;
};
export type LoteLana = { batchId?: string; amount?: number; expiresAt?: string | null; origin?: string };
export type MovimientoLana = {
  id: string; type?: 'CREDIT' | 'DEBIT' | 'EXPIRATION' | 'LOSS' | string; amount?: number; source?: string; description?: string; createdAt?: string;
  allocations?: LoteLana[];
};
export type ItemCanje = {
  id: string; name?: string; description?: string; lanasCost?: number; marketPriceCents?: number;
  rewardType?: string; canRedeem?: boolean; missingLanas?: number; soldOut?: boolean;
};
export type CatalogoCanje = { availableBalance?: number; subscriptionActive?: boolean; items?: ItemCanje[] };
export type Canje = {
  id: string; itemId?: string; code?: string | null; redemptionInstructions?: string | null; lanasSpent?: number; rewardType?: string;
  itemName?: string; name?: string; redeemedAt?: string; createdAt?: string; expiresAt?: string | null; status?: string;
  discountDeliveryMode?: 'DNI' | string | null; merchant?: { id?: string; tradeName?: string; logoUrl?: string | null } | null;
};

export type Sorteo = {
  id: string; name?: string; description?: string; drawDate?: string; date?: string; hour?: string;
  shortDay?: string; dayNumber?: string; imageUrl?: string; isFeatured?: boolean; isLive?: boolean;
  canBuy?: boolean; userChances?: number; priority?: number; prizeId?: string; coverageMessage?: string;
  termAndConditionsUrl?: string | null; termsAndConditionsUrl?: string | null; opportunitiesText?: string;
};
export type Ganador = {
  raffleId: string; name?: string; prizeName?: string; prizeImageUrl?: string; photoUrl?: string;
  userPublicId?: string; drawDate?: string; hour?: string; hasParticipationList?: boolean;
};
export type DesafioVip = {
  id: string; name?: string; description?: string; startsAt?: string; endsAt?: string; remainingMs?: number; completed?: boolean;
  missions?: { missionId: string; title?: string; progress?: number; goal?: number; completed?: boolean }[];
};
export type ParticipacionSorteo = {
  raffleId: string; prizeName?: string; totalChances?: number; origin?: string; isWinner?: boolean; subjectToRenewal?: boolean;
  breakdown?: { subscription?: number; purchased?: number; wallet?: number; promo?: number };
};
export type GrupoParticipaciones = { drawDate?: string; raffles?: ParticipacionSorteo[] };
export type FechasVip = { hasAccess?: boolean; comingSoon?: boolean; dates?: string[]; challenges?: DesafioVip[] };

export type Beneficio = {
  id: string; name?: string; description?: string; brand?: { name?: string; logo?: string }; categoryId?: string;
  deliveryMethod?: string; highlightLabel?: string; highlightValue?: string; imageUrl?: string;
  isAvailable?: boolean; isExhausted?: boolean; isFeatured?: boolean; usesLeft?: number; endDate?: string;
};
export type Categoria = { id: string; name?: string; isActive?: boolean };
export type DetalleBeneficio = {
  id?: string; name?: string; description?: string | null; imageUrl?: string | null; brand?: { name?: string; logo?: string | null } | null;
  highlightValue?: string | null; highlightLabel?: string | null; startDate?: string | null; endDate?: string | null; toEnd?: string | null;
  considerations?: string[] | null; disclaimerNote?: string | null; termsAndConditionsUrl?: string | null; termsAndConditionsText?: string | null;
  coverage?: 'LIMA' | 'PROVINCES' | 'LIMA_AND_PROVINCES' | string | null; departments?: { code?: string; name?: string }[] | null;
  deliveryMethod?: 'PROMO_CODE' | 'REDIRECT_LINK' | 'PROMO_CODE_AND_LINK' | 'IN_PERSON' | 'EXTERNAL' | string;
  isAvailable?: boolean; redemptionEnabled?: boolean; usesLeft?: number | null; maxUses?: number | null; isUnlimited?: boolean; isExhausted?: boolean;
  promoCode?: string | null; redirectUrl?: string | null; activation?: { activatedAt?: string; channel?: string } | null;
};
export type CuponExterno = { status?: string; coupon?: { code?: string; qrUrl?: string | null; remainingUses?: number | null; validFrom?: string; validUntil?: string } | null };
export type Activacion = { activationId?: string; alreadyActivated?: boolean; deliveryMethod?: string; promoCode?: string; redirectUrl?: string; usesLeft?: number };
export type FlashMe = {
  id?: string; startsAt?: string; endsAt?: string; quota?: number; usersEnjoying?: number; soldOut?: boolean; benefitSoldOut?: boolean;
  alreadyClaimed?: boolean; deliveryMode?: string; codeDisplay?: string;
  benefit?: {
    name?: string; description?: string; highlightValue?: string; imageUrl?: string; redirectUrl?: string; disclaimerNote?: string;
    brand?: { name?: string; logo?: string };
    termsAndConditionsText?: string | null; termsAndConditionsUrl?: string | null;
  } | null;
  claim?: { claimedAt?: string; code?: string | null; dniInstructions?: string | null; lanasAmount?: number | null; option?: 'BENEFIT' | 'LANAS' | string } | null;
  lanasOption?: { amount?: number; quota?: { total?: number; used?: number }; soldOut?: boolean } | null;
  termsAndConditionsText?: string | null; termsAndConditionsUrl?: string | null;
};
export type FlashMeRespuesta = { flashBenefit?: FlashMe | null } | FlashMe | null;
export type CodigoFlash = { code?: string | null; dniInstructions?: string | null; lanasAmount?: number | null; option?: string };

export type CofreMe = {
  status?: 'NOT_ELIGIBLE' | 'NO_CHEST' | 'OUT_OF_WINDOW' | 'AVAILABLE' | 'SOLD_OUT' | 'OPENED' | 'APPLIED' | 'EXPIRED' | 'EXCHANGED' | string;
  opensAt?: string | null; closesAt?: string | null; deliveredThisCycle?: number | null; nextAvailableAt?: string | null;
  cycleStock?: { total?: number | null; delivered?: number | null; remaining?: number | null } | null;
  opening?: AperturaCofre | null;
};
export type AperturaCofre = {
  id?: string; rewardType?: 'LANAS' | 'GIFT_CARD' | 'DISCOUNT_CODE' | 'DISCOUNT_DNI' | string; rewardLabel?: string;
  lanasAmount?: number | null; rewardExpiresAt?: string | null; status?: 'OPENED' | 'APPLIED' | 'EXPIRED' | 'EXCHANGED' | string;
  rewardImageUrl?: string | null;
  openedAt?: string; appliedAt?: string | null; cycleEndsAt?: string; exchangedAt?: string | null;
  exchangeOption?: { lanasAmount?: number } | null;
};
export type AplicacionCofre = { codeDisplay?: 'TEXT' | 'QR' | null; shownCode?: string | null; instructions?: string | null };

export type MisionApi = {
  id: string; title?: string; description?: string; type?: string; cycle?: string;
  rewardLanas?: number; progress?: number; goal?: number; completed?: boolean;
};
export type Recompensa = {
  id: string; awardedAt?: string; rewardDescription?: string; rewardExpiresAt?: string | null; rewardLanas?: number;
  sourceId?: string; sourceType?: string;
};
export type ConfirmacionPerfil = { missionId?: string; completed?: boolean; progress?: number; goal?: number; rewardLanas?: number };
export type MisionesMe = { eligible?: boolean; highlightedMissionId?: string | null; items?: MisionApi[] };
export type ReferidosMe = {
  code?: string; shareText?: string; eligible?: boolean;
  missions?: { missionId?: string; title?: string; goal?: number; progress?: number; rewardLanas?: number; completed?: boolean }[];
  mission?: { eligible?: boolean; goal?: number; progress?: number; rewardLanas?: number };
};
export type Elegibilidad = { valid?: boolean; reason?: string };

export type PromoValidacion = { isValid?: boolean; valid?: boolean; message?: string; bonusChances?: number; potentialBonus?: number; capWarning?: string;
  promoCode?: { id?: string; code?: string; type?: string; benefitValue?: number | string } | null };
export type HistorialGanadores = {
  data?: { raffleId?: string; prizeId?: string; prizeName?: string; prizeImageUrl?: string | null; drawDate?: string; hour?: string; name?: string;
    userPublicId?: string; isLive?: boolean; hasParticipationList?: boolean; photoUrl?: string | null }[];
  pagination?: { total?: number; page?: number; lastPage?: number; take?: number };
};
export type HistorialPagos = { data?: { invoiceId?: string; orderNumber?: string; type?: string; date?: string; amountTotalCents?: number; currency?: string; invoiceStatus?: string }[]; page?: number; limit?: number; total?: number };
export type OfertasUpgrade = {
  currentSubscription?: { planName?: string; status?: string; daysUntilExpiration?: number; isConcurrent?: boolean; optionsPerRaffle?: number } | null;
  offers?: { planId?: string; planName?: string; billingCycle?: string; durationMonths?: number; optionsPerRaffle?: number; bonusChances?: number;
    subtotalAmount?: number | string; igvAmount?: number | string; totalUpgradeAmount?: number | string; movementType?: string; isSamePlan?: boolean; endDate?: string }[];
};
export type Configuraciones = { cutOffTime?: { isCutOffTime?: boolean; textCutOffTime?: string } | null; subscriptionMessages?: { subscriptionCoverage?: string } | null };
export type PlanApi = { id: string; name?: string; billingCycle?: string; price?: number | string; chances?: number; optionsPerRaffle?: number };
export type ResultadoPago = {
  operationCode?: string; amountTotal?: string; planName?: string; paymentMethod?: string; date?: string;
  paymentPendingValidation?: boolean; referralApplied?: boolean; totalChances?: number;
  raffles?: ({ id?: string; name?: string; drawDate?: string } | string)[];
};
