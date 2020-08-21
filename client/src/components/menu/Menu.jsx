import React from "react";
import { Container } from "./Menu.styles";
import { Button } from "../../GlobalStyles";
import { useAuth } from "../../hooks/useAuth";
import { useModal } from "../../hooks/useModal";
import { useMatch } from "../../hooks/useMatch";
import { useHistory } from "react-router";
import { getToken } from "../../helpers/getToken";
import { BeatLoader } from "react-spinners";

const AVERAGE_GAMELENGTH = 35;

const fetchLatest = async (id) => {
  const res = await fetch(`/api/matchup/latest/${id}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: getToken(),
    },
    credentials: "include",
  });
  return res.json();
};

const finishMatch = async (match) => {
  try {
    const data = await fetchLatest(match.gameId);
    return data;
  } catch (err) {
    return null;
  }
};

const Menu = () => {
  const history = useHistory();
  const modal = useModal();
  const { logout, isAuthenticated, user, isAllowed } = useAuth();
  const {
    findMatch,
    hasMatch,
    loading,
    match,
    setMatch,
    confirmed,
    timer,
    minutes,
  } = useMatch();

  const handleLogout = (e) => {
    e.preventDefault();
    setMatch(null);
    logout();
    history.push("/");
  };

  const handleNavigate = (e) => {
    e.preventDefault();
    (async () => {
      const { confirmed, updated, id } = await finishMatch(match);

      if (!confirmed || (confirmed && !updated)) {
        history.push(`/dex/${id}`);
      }

      if (confirmed && updated) {
        const _match = await findMatch();
        if (_match) {
          history.push(`/match/${_match.gameId}`);
        } else {
          history.push(`/`);
          setMatch(null);
        }
      }
    })();
  };

  return (
    <Container
      isOpen={
        modal.isOpen("register") ||
        modal.isOpen("login") ||
        modal.isOpen("summoner")
      }
    >
      <Container.Buttons>
        {!isAuthenticated && (
          <>
            <Button menu onClick={() => modal.setModal("register")}>
              Register
            </Button>
            <Button
              secondary
              menu
              onClick={() => modal.setModal("login")}
              style={{ marginLeft: "1.25rem" }}
            >
              Login
            </Button>
          </>
        )}

        {isAuthenticated && (
          <>
            {!user.summoner && (
              <Button onClick={() => modal.setModal("summoner")}>
                Add Summoner Account
              </Button>
            )}

            {user.summoner && (
              <>
                {!hasMatch && (
                  <>
                    {!confirmed && (
                      <Button header onClick={findMatch} disabled={loading}>
                        {loading && <BeatLoader color="#B8D0EC" />}
                        {!loading && "Not in a match"}
                      </Button>
                    )}
                  </>
                )}

                {hasMatch && (
                  <>
                    {!confirmed && (
                      <Button
                        header
                        onClick={() => history.push(`/match/${match.gameId}`)}
                      >
                        You are in a match
                      </Button>
                    )}
                    {confirmed && (
                      <Button
                        header
                        aboveAverage={minutes >= AVERAGE_GAMELENGTH}
                        onClick={handleNavigate}
                      >
                        {timer.split(":")[1] !== "00" ? (
                          timer
                        ) : (
                          <BeatLoader color="#B8D0EC" />
                        )}
                      </Button>
                    )}
                  </>
                )}
              </>
            )}
            <Button
              logout
              menu
              onClick={handleLogout}
              style={{ marginLeft: "1.25rem" }}
            >
              Log out
            </Button>
          </>
        )}
      </Container.Buttons>
    </Container>
  );
};

export default Menu;
