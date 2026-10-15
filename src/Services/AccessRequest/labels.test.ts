import {
  ACCESS_REQUEST_TYPE_LABELS,
  accessRequestConflictLabel,
  accessRequestConflictMessage,
  accessRequestEventLabel,
  accessRequestFieldLabel,
  accessRequestMatchSignalLabel,
  accessRequestTypeLabel,
} from "./labels";

describe("access request type labels", () => {
  it("traduz todos os tipos de solicitação conhecidos", () => {
    expect(ACCESS_REQUEST_TYPE_LABELS).toEqual({
      MICROSOFT_LINK: "Vinculação de conta Microsoft",
      PASSWORD_RESET: "Redefinição de senha",
      ACCOUNT_RECOVERY: "Recuperação de conta",
      NEW_ACCESS: "Novo acesso",
    });
  });

  it("mantém um tipo novo visível até que ele receba uma tradução", () => {
    expect(accessRequestTypeLabel("FUTURE_TYPE")).toBe("FUTURE_TYPE");
    expect(accessRequestTypeLabel()).toBe("—");
  });

  it("traduz os códigos técnicos apresentados na análise administrativa", () => {
    expect(accessRequestMatchSignalLabel("NAME_SIMILAR")).toBe("Nome semelhante");
    expect(accessRequestConflictLabel("PROFILE_ALREADY_HAS_USER")).toBe(
      "Perfil já possui usuário"
    );
    expect(accessRequestConflictMessage("MULTIPLE_STRONG_PROFILE_CANDIDATES")).toBe(
      "Foram encontrados vários perfis com dados muito semelhantes. Confirme qual é o perfil correto."
    );
    expect(accessRequestEventLabel("REVIEW_STARTED")).toBe("Análise iniciada");
    expect(accessRequestEventLabel("ADMIN_MARKED_COMPLETED")).toBe(
      "Solicitação concluída pela administração"
    );
    expect(accessRequestFieldLabel("institutionalEmail")).toBe("E-mail institucional");
  });

  it("mantém códigos desconhecidos visíveis como fallback", () => {
    expect(accessRequestMatchSignalLabel("NEW_SIGNAL")).toBe("NEW_SIGNAL");
    expect(accessRequestConflictLabel("NEW_CONFLICT")).toBe("NEW_CONFLICT");
    expect(accessRequestEventLabel("NEW_EVENT")).toBe("NEW_EVENT");
    expect(accessRequestFieldLabel("newField")).toBe("newField");
  });
});
